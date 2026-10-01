const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const {
  MAX_FILE_SIZE_BYTES,
  MAX_USER_STORAGE_BYTES,
  getKindFromMimetype,
  isExtensionAllowedForKind,
  detectSignatureKind,
} = require("../config/uploadConfig");
const {
  getUserStorageSummary,
  withUserStorageLock,
  getUserStorageUsed,
} = require("../database/documentModel");

console.log("UPLOAD ROUTES LOADED");

const router = express.Router();

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ==========================================
// MULTER STORAGE
// ==========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    const name = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "_");

    cb(null, `${Date.now()}-${name}${ext}`);
  },
});

// ==========================================
// MULTER
//
// FEATURE 1 (allowed types) + FEATURE 2 (individual
// file-size limit): both come from config/uploadConfig.js,
// never hardcoded here.
//
// fileFilter is a first, cheap check based on MIME type
// + extension. It is NOT sufficient on its own (a browser
// MIME type can be spoofed), so we additionally verify the
// file's actual byte signature once it has been written to
// disk, before touching the database — see verifySignature
// below.
// ==========================================

const upload = multer({
  storage,

  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },

  fileFilter: (req, file, cb) => {
    const kind = getKindFromMimetype(file.mimetype);

    if (!kind || !isExtensionAllowedForKind(file.originalname, kind)) {
      return cb(
        new Error("Unsupported file type. Allowed file types: PDF, MP3, MP4")
      );
    }

    cb(null, true);
  },
});

// ==========================================
// HELPER: delete a physical file safely
// ==========================================

function deletePhysicalFile(filename) {
  if (!filename) return;

  const physicalPath = path.join(uploadDir, filename);

  if (fs.existsSync(physicalPath)) {
    try {
      fs.unlinkSync(physicalPath);
    } catch (err) {
      console.error("FAILED TO DELETE PHYSICAL FILE:", err.message);
    }
  }
}

// ==========================================
// HELPER: verify the file's real content
// matches the claimed/allowed type by reading
// its actual byte signature ("magic bytes").
// Returns true/false.
// ==========================================

function verifySignature(filePath, mimetype) {
  const expectedKind = getKindFromMimetype(mimetype);

  if (!expectedKind) return false;

  // Only the first few bytes are needed to identify
  // PDF / MP3 / MP4 — no need to read the whole file.
  const fd = fs.openSync(filePath, "r");
  const headerBuffer = Buffer.alloc(16);

  try {
    fs.readSync(fd, headerBuffer, 0, 16, 0);
  } finally {
    fs.closeSync(fd);
  }

  const detectedKind = detectSignatureKind(headerBuffer);

  return detectedKind === expectedKind;
}

// ==========================================
// GET /api/documents
// LOAD USER DOCUMENTS
// ==========================================

router.get(
  "/documents",
  authMiddleware,
  async (req, res) => {
    console.log("========== GET DOCUMENTS ==========");
    console.log("USER ID:", req.user.id);

    try {
      const [rows] = await db.query(
        `
        SELECT
          id,
          file_name,
          file_path,
          file_type,
          file_size,
          uploaded_at
        FROM documents
        WHERE user_id = ?
        ORDER BY uploaded_at DESC
        `,
        [req.user.id]
      );

      console.log("DOCUMENTS FOUND:", rows);

      res.json({
        success: true,
        documents: rows,
      });
    } catch (err) {
      console.error(
        "GET DOCUMENTS ERROR:",
        err
      );

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

// ==========================================
// GET /api/documents/storage
// LIVE STORAGE USAGE FOR THE AUTHENTICATED USER
//
// { used, limit, remaining } in bytes.
// The backend/database is the source of truth —
// the frontend only formats these bytes for display.
// ==========================================

router.get(
  "/documents/storage",
  authMiddleware,
  async (req, res) => {
    try {
      const summary = await getUserStorageSummary(req.user.id);

      res.json({
        success: true,
        used: summary.used,
        limit: summary.limit,
        remaining: summary.remaining,
        maxFileSize: MAX_FILE_SIZE_BYTES,
      });
    } catch (err) {
      console.error("GET STORAGE SUMMARY ERROR:", err);

      res.status(500).json({
        success: false,
        message: err.message || "Failed to load storage usage",
      });
    }
  }
);

// ==========================================
// POST /api/upload
// UPLOAD DOCUMENT
//
// FEATURE 3: individual file-size limit is enforced by
// multer's `limits.fileSize` (MAX_FILE_SIZE_BYTES) and
// surfaced as a clear error by the error-handling
// middleware at the bottom of this file.
//
// FEATURE 4/5: the 50 MB per-user quota is enforced here,
// on the backend, using the ACTUAL size multer measured
// from the uploaded bytes (req.file.size) — never a value
// sent by the frontend. The check + insert happen while
// holding a per-user MySQL named lock so two concurrent
// uploads can't both slip through (see FEATURE/point 17).
// ==========================================

router.post(
  "/upload",
  authMiddleware,
  upload.single("document"),
  async (req, res) => {
    console.log("UPLOAD REQUEST RECEIVED");

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const cleanupAndReject = (status, message) => {
      deletePhysicalFile(req.file.filename);
      return res.status(status).json({ success: false, message });
    };

    try {
      // ------------------------------------------------
      // STEP 1: verify the file's real signature matches
      // its claimed type. Never trust extension/MIME alone.
      // ------------------------------------------------
      const filePath = path.join(uploadDir, req.file.filename);

      if (!verifySignature(filePath, req.file.mimetype)) {
        return cleanupAndReject(
          400,
          "Unsupported or corrupted file. Allowed file types: PDF, MP3, MP4."
        );
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      const fileSize = req.file.size; // actual size measured by multer on disk

      // ------------------------------------------------
      // STEP 2: atomically check + reserve the user's
      // 50 MB quota, then insert the DB record, all while
      // holding a per-user lock.
      // ------------------------------------------------
      let insertResult;
      let storageAfter;

      try {
        await withUserStorageLock(req.user.id, async (connection) => {
          const used = await getUserStorageUsed(req.user.id, connection);

          if (used + fileSize > MAX_USER_STORAGE_BYTES) {
            const err = new Error("STORAGE_LIMIT_REACHED");
            err.code = "STORAGE_LIMIT_REACHED";
            throw err;
          }

          const [result] = await connection.query(
            `
            INSERT INTO documents
            (
              user_id,
              file_name,
              file_path,
              file_type,
              file_size
            )
            VALUES (?, ?, ?, ?, ?)
            `,
            [
              req.user.id,
              req.file.originalname,
              fileUrl,
              req.file.mimetype,
              fileSize,
            ]
          );

          insertResult = result;
          storageAfter = used + fileSize;
        });
      } catch (lockErr) {
        if (lockErr.code === "STORAGE_LIMIT_REACHED") {
          return cleanupAndReject(
            400,
            "Storage limit reached. You can store a maximum of 50 MB of files. Please delete an existing file or reduce the file size."
          );
        }
        throw lockErr;
      }

      console.log("FILE SAVED:", req.file.filename);
      console.log("DATABASE DOCUMENT ID:", insertResult.insertId);

      res.json({
        success: true,
        message: "File uploaded successfully",

        file: {
          id: insertResult.insertId,
          originalName: req.file.originalname,
          filename: req.file.filename,
          mimetype: req.file.mimetype,
          size: fileSize,
          url: fileUrl,
        },

        storage: {
          used: storageAfter,
          limit: MAX_USER_STORAGE_BYTES,
          remaining: Math.max(MAX_USER_STORAGE_BYTES - storageAfter, 0),
        },
      });
    } catch (err) {
      console.error("UPLOAD ERROR:", err);

      // Don't leave an orphan physical file if something
      // failed after it was written to disk.
      deletePhysicalFile(req.file.filename);

      res.status(500).json({
        success: false,
        message: err.message || "File upload failed",
      });
    }
  }
);

// ==========================================
// DELETE /api/documents/:id
// DELETE DOCUMENT
//
// FEATURE 9: storage is freed as soon as the DB row is
// removed, since usage is always computed live from
// SUM(file_size). Ownership is re-verified here so a user
// can never delete another user's document by guessing an ID.
// ==========================================

router.delete(
  "/documents/:id",
  authMiddleware,
  async (req, res) => {
    console.log(
      "========== DELETE DOCUMENT =========="
    );

    try {
      const documentId =
        Number(req.params.id);

      console.log(
        "DOCUMENT ID:",
        documentId
      );

      console.log(
        "USER ID:",
        req.user.id
      );

      if (!documentId) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid document ID",
        });
      }

      // Find document belonging
      // to the logged-in user
      const [rows] = await db.query(
        `
        SELECT
          id,
          file_path
        FROM documents
        WHERE id = ?
        AND user_id = ?
        `,
        [
          documentId,
          req.user.id,
        ]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Document not found",
        });
      }

      const filePath =
        rows[0].file_path;

      // Delete database record
      await db.query(
        `
        DELETE FROM documents
        WHERE id = ?
        AND user_id = ?
        `,
        [
          documentId,
          req.user.id,
        ]
      );

      console.log(
        "DATABASE RECORD DELETED"
      );

      // Delete physical file
      if (filePath) {
        const filename =
          path.basename(filePath);

        deletePhysicalFile(filename);

        console.log(
          "PHYSICAL FILE DELETE ATTEMPTED:",
          filename
        );
      }

      const storage = await getUserStorageSummary(req.user.id);

      res.json({
        success: true,
        message:
          "Document deleted successfully",
        storage,
      });
    } catch (err) {
      console.error(
        "DELETE DOCUMENT ERROR:",
        err
      );

      res.status(500).json({
        success: false,
        message:
          err.message ||
          "Failed to delete document",
      });
    }
  }
);

// ==========================================
// PUT /api/documents/:id
// RENAME DOCUMENT
// ==========================================

router.put(
  "/documents/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const documentId = Number(req.params.id);
      const { fileName } = req.body;

      if (!documentId || !fileName) {
        return res.status(400).json({
          success: false,
          message: "Document ID and new name are required",
        });
      }

      const newName = fileName.trim();

      if (!newName) {
        return res.status(400).json({
          success: false,
          message: "File name cannot be empty",
        });
      }

      const [result] = await db.query(
        `
        UPDATE documents
        SET file_name = ?
        WHERE id = ?
        AND user_id = ?
        `,
        [
          newName,
          documentId,
          req.user.id,
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Document not found",
        });
      }

      res.json({
        success: true,
        message: "Document renamed successfully",
        fileName: newName,
      });

    } catch (err) {
      console.error("RENAME DOCUMENT ERROR:", err);

      res.status(500).json({
        success: false,
        message:
          err.message || "Failed to rename document",
      });
    }
  }
);

// ==========================================
// MULTER / FILE ERRORS
//
// FEATURE 3: a distinct, clear message for the
// individual-file-too-large case (multer's
// LIMIT_FILE_SIZE), separate from the 50 MB
// total-quota message returned above.
// ==========================================

router.use(
  (err, req, res, next) => {
    console.error(
      "UPLOAD MIDDLEWARE ERROR:",
      err
    );

    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File is too large. Please reduce the file size and try again.",
      });
    }

    res.status(400).json({
      success: false,
      message:
        err.message ||
        "File upload failed",
    });
  }
);

module.exports = router;
