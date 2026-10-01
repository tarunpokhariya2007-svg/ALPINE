const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

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
// ALLOWED FILE TYPES
// ==========================================

const allowedTypes = new Set([
  // PDF
  "application/pdf",

  // Images
  "image/png",
  "image/jpeg",
  "image/jpg",

  // Audio
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
  "audio/mp4",
  "audio/x-m4a",

  // Video
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

// ==========================================
// MULTER
// ==========================================

const upload = multer({
  storage,

  limits: {
    fileSize: 100 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    if (allowedTypes.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Unsupported file type. Allowed: PDF, PNG, JPG, JPEG, MP3, WAV, WEBM, M4A, MP4, MOV"
        )
      );
    }
  },
});

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
// POST /api/upload
// UPLOAD DOCUMENT
// ==========================================

router.post(
  "/upload",
  authMiddleware,
  upload.single("document"),
  async (req, res) => {
    console.log("UPLOAD REQUEST RECEIVED");

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const fileUrl =
        `/uploads/${req.file.filename}`;

      console.log(
        "FILE SAVED:",
        req.file.filename
      );

      // Save document information in MySQL
      const [result] = await db.query(
        `
        INSERT INTO documents
        (
          user_id,
          file_name,
          file_path,
          file_type
        )
        VALUES (?, ?, ?, ?)
        `,
        [
          req.user.id,
          req.file.originalname,
          fileUrl,
          req.file.mimetype,
        ]
      );

      console.log(
        "DATABASE DOCUMENT ID:",
        result.insertId
      );

      res.json({
        success: true,
        message: "File uploaded successfully",

        file: {
          id: result.insertId,
          originalName:
            req.file.originalname,
          filename:
            req.file.filename,
          mimetype:
            req.file.mimetype,
          size:
            req.file.size,
          url: fileUrl,
        },
      });
    } catch (err) {
      console.error(
        "UPLOAD ERROR:",
        err
      );

      res.status(500).json({
        success: false,
        message:
          err.message ||
          "File upload failed",
      });
    }
  }
);

// ==========================================
// DELETE /api/documents/:id
// DELETE DOCUMENT
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

        const physicalPath =
          path.join(
            uploadDir,
            filename
          );

        if (
          fs.existsSync(
            physicalPath
          )
        ) {
          fs.unlinkSync(
            physicalPath
          );

          console.log(
            "PHYSICAL FILE DELETED:",
            physicalPath
          );
        } else {
          console.log(
            "PHYSICAL FILE NOT FOUND:",
            physicalPath
          );
        }
      }

      res.json({
        success: true,
        message:
          "Document deleted successfully",
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
// ==========================================

router.use(
  (err, req, res, next) => {
    console.error(
      "UPLOAD MIDDLEWARE ERROR:",
      err
    );

    res.status(400).json({
      success: false,
      message:
        err.message ||
        "File upload failed",
    });
  }
);

module.exports = router;