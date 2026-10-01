const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");

const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

// Make sure the upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/* =========================================================
   ALLOWED FILE TYPES
========================================================= */

const ALLOWED_MIME_TYPES = new Set([
    "application/pdf",

    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "image/gif",

    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/mp4",
    "audio/x-m4a",

    "video/mp4",
    "video/quicktime",
    "video/webm"
]);

/* =========================================================
   MULTER STORAGE
========================================================= */

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_DIR);
    },

    filename: function (req, file, cb) {
        const extension = path.extname(file.originalname);

        const safeExtension =
            extension && extension.length <= 20
                ? extension.toLowerCase()
                : "";

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1e9) +
            safeExtension;

        cb(null, uniqueName);
    }
});

/* =========================================================
   MULTER CONFIGURATION
========================================================= */

const upload = multer({
    storage,

    limits: {
        fileSize: MAX_FILE_SIZE
    },

    fileFilter: function (req, file, cb) {
        if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
            return cb(
                new Error(
                    "Unsupported file type. Allowed files: PDF, PNG, JPG, WEBP, GIF, MP3, WAV, M4A, MP4, MOV and WEBM."
                )
            );
        }

        cb(null, true);
    }
});

/* =========================================================
   DOCUMENT PASSWORD MIDDLEWARE
========================================================= */

async function documentPasswordMiddleware(req, res, next) {
    try {
        const password = req.headers["x-document-password"];

        if (
            typeof password !== "string" ||
            password.length === 0
        ) {
            return res.status(401).json({
                success: false,
                message: "Document Security Password is required."
            });
        }

        const [rows] = await db.query(
            `
            SELECT password_hash
            FROM document_security
            WHERE user_id = ?
            LIMIT 1
            `,
            [req.user.id]
        );

        if (!rows || rows.length === 0) {
            return res.status(403).json({
                success: false,
                message:
                    "Document Security Password has not been configured."
            });
        }

        const passwordMatches = await bcrypt.compare(
            password,
            rows[0].password_hash
        );

        if (!passwordMatches) {
            return res.status(403).json({
                success: false,
                message: "Invalid Document Security Password."
            });
        }

        next();
    } catch (error) {
        console.error(
            "DOCUMENT PASSWORD VERIFICATION ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Unable to verify Document Security Password."
        });
    }
}

/* =========================================================
   HELPER: GET SAFE FILE PATH
========================================================= */

function getPhysicalFilePath(filePath) {
    if (!filePath) {
        return null;
    }

    /*
     * Database normally stores:
     * /uploads/filename.pdf
     *
     * We only use the basename so a database value cannot
     * escape the uploads directory.
     */

    const fileName = path.basename(filePath);

    if (!fileName) {
        return null;
    }

    return path.join(UPLOAD_DIR, fileName);
}

/* =========================================================
   GET USER DOCUMENTS
========================================================= */

router.get(
    "/documents",
    authMiddleware,
    documentPasswordMiddleware,
    async (req, res) => {
        try {
            const [documents] = await db.query(
                `
                SELECT
                    id,
                    user_id,
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

            /*
             * Do NOT expose a publicly accessible /uploads URL.
             *
             * The frontend should use:
             * /api/documents/:id/content
             * /api/documents/:id/download
             *
             * after document-password verification.
             */

            const safeDocuments = documents.map((document) => ({
                id: document.id,
                user_id: document.user_id,
                file_name: document.file_name,
                file_type: document.file_type,
                uploaded_at: document.uploaded_at
            }));

            return res.json({
                success: true,
                documents: safeDocuments
            });
        } catch (error) {
            console.error(
                "GET DOCUMENTS ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to load documents."
            });
        }
    }
);

/* =========================================================
   UPLOAD DOCUMENT
========================================================= */

router.post(
    "/upload",
    authMiddleware,
    documentPasswordMiddleware,
    upload.single("document"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "No file was uploaded."
                });
            }

            const fileName = req.file.originalname;
            const filePath = `/uploads/${req.file.filename}`;
            const fileType = req.file.mimetype;

            /*
             * IMPORTANT:
             *
             * Your actual documents table only contains:
             *
             * id
             * user_id
             * file_name
             * file_path
             * file_type
             * uploaded_at
             *
             * Therefore we DO NOT insert:
             *
             * original_name
             * file_size
             * mimetype
             */

            const [result] = await db.query(
                `
                INSERT INTO documents
                    (
                        user_id,
                        file_name,
                        file_path,
                        file_type
                    )
                VALUES
                    (?, ?, ?, ?)
                `,
                [
                    req.user.id,
                    fileName,
                    filePath,
                    fileType
                ]
            );

            return res.status(201).json({
                success: true,
                message: "Document uploaded successfully.",
                file: {
                    id: result.insertId,
                    name: fileName,
                    type: fileType
                }
            });
        } catch (error) {
            console.error(
                "UPLOAD DOCUMENT ERROR:",
                error
            );

            /*
             * If the database insert fails after multer has
             * created the physical file, remove that file.
             */

            if (req.file && req.file.path) {
                try {
                    if (fs.existsSync(req.file.path)) {
                        fs.unlinkSync(req.file.path);
                    }
                } catch (cleanupError) {
                    console.error(
                        "UPLOAD CLEANUP ERROR:",
                        cleanupError
                    );
                }
            }

            return res.status(500).json({
                success: false,
                message: "File upload failed."
            });
        }
    }
);

/* =========================================================
   VIEW / OPEN DOCUMENT
========================================================= */

router.get(
    "/documents/:id/content",
    authMiddleware,
    documentPasswordMiddleware,
    async (req, res) => {
        try {
            const documentId = Number(req.params.id);

            if (!Number.isInteger(documentId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid document ID."
                });
            }

            const [rows] = await db.query(
                `
                SELECT
                    id,
                    file_name,
                    file_path,
                    file_type
                FROM documents
                WHERE id = ?
                  AND user_id = ?
                LIMIT 1
                `,
                [documentId, req.user.id]
            );

            if (!rows || rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Document not found."
                });
            }

            const document = rows[0];

            const physicalPath = getPhysicalFilePath(
                document.file_path
            );

            if (!physicalPath) {
                return res.status(404).json({
                    success: false,
                    message: "Document file path is invalid."
                });
            }

            if (!fs.existsSync(physicalPath)) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Document file is no longer available."
                });
            }

            res.setHeader(
                "Content-Type",
                document.file_type ||
                    "application/octet-stream"
            );

            res.setHeader(
                "Content-Disposition",
                `inline; filename="${encodeURIComponent(
                    document.file_name
                )}"`
            );

            return res.sendFile(physicalPath);
        } catch (error) {
            console.error(
                "VIEW DOCUMENT ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to open document."
            });
        }
    }
);

/* =========================================================
   DOWNLOAD DOCUMENT
========================================================= */

router.get(
    "/documents/:id/download",
    authMiddleware,
    documentPasswordMiddleware,
    async (req, res) => {
        try {
            const documentId = Number(req.params.id);

            if (!Number.isInteger(documentId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid document ID."
                });
            }

            const [rows] = await db.query(
                `
                SELECT
                    id,
                    file_name,
                    file_path,
                    file_type
                FROM documents
                WHERE id = ?
                  AND user_id = ?
                LIMIT 1
                `,
                [documentId, req.user.id]
            );

            if (!rows || rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Document not found."
                });
            }

            const document = rows[0];

            const physicalPath = getPhysicalFilePath(
                document.file_path
            );

            if (!physicalPath) {
                return res.status(404).json({
                    success: false,
                    message: "Document file path is invalid."
                });
            }

            if (!fs.existsSync(physicalPath)) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Document file is no longer available."
                });
            }

            return res.download(
                physicalPath,
                document.file_name
            );
        } catch (error) {
            console.error(
                "DOWNLOAD DOCUMENT ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to download document."
            });
        }
    }
);

/* =========================================================
   DELETE DOCUMENT
========================================================= */

router.delete(
    "/documents/:id",
    authMiddleware,
    documentPasswordMiddleware,
    async (req, res) => {
        try {
            const documentId = Number(req.params.id);

            if (!Number.isInteger(documentId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid document ID."
                });
            }

            const [rows] = await db.query(
                `
                SELECT
                    id,
                    file_path
                FROM documents
                WHERE id = ?
                  AND user_id = ?
                LIMIT 1
                `,
                [documentId, req.user.id]
            );

            if (!rows || rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Document not found."
                });
            }

            const document = rows[0];

            const physicalPath = getPhysicalFilePath(
                document.file_path
            );

            /*
             * Delete database record first.
             */

            await db.query(
                `
                DELETE FROM documents
                WHERE id = ?
                  AND user_id = ?
                `,
                [documentId, req.user.id]
            );

            /*
             * Then remove physical file.
             */

            if (
                physicalPath &&
                fs.existsSync(physicalPath)
            ) {
                try {
                    fs.unlinkSync(physicalPath);
                } catch (fileError) {
                    console.error(
                        "DELETE PHYSICAL FILE ERROR:",
                        fileError
                    );
                }
            }

            return res.json({
                success: true,
                message:
                    "Document deleted successfully."
            });
        } catch (error) {
            console.error(
                "DELETE DOCUMENT ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to delete document."
            });
        }
    }
);

/* =========================================================
   RENAME DOCUMENT
========================================================= */

router.put(
    "/documents/:id",
    authMiddleware,
    documentPasswordMiddleware,
    async (req, res) => {
        try {
            const documentId = Number(req.params.id);
            const newName =
                typeof req.body?.file_name === "string"
                    ? req.body.file_name.trim()
                    : "";

            if (!Number.isInteger(documentId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid document ID."
                });
            }

            if (!newName) {
                return res.status(400).json({
                    success: false,
                    message:
                        "A document name is required."
                });
            }

            if (newName.length > 255) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Document name must not exceed 255 characters."
                });
            }

            /*
             * Prevent path traversal or directory names
             * from being stored as the document name.
             */

            const cleanedName = path.basename(newName);

            if (
                !cleanedName ||
                cleanedName === "." ||
                cleanedName === ".."
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid document name."
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
                    cleanedName,
                    documentId,
                    req.user.id
                ]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Document not found."
                });
            }

            return res.json({
                success: true,
                message:
                    "Document renamed successfully.",
                file_name: cleanedName
            });
        } catch (error) {
            console.error(
                "RENAME DOCUMENT ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Failed to rename document."
            });
        }
    }
);

/* =========================================================
   MULTER / GENERAL ERROR HANDLER
========================================================= */

router.use((error, req, res, next) => {
    console.error(
        "DOCUMENT ROUTE ERROR:",
        error
    );

    if (
        error instanceof multer.MulterError
    ) {
        if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({
                success: false,
                message:
                    "File is too large. Maximum allowed size is 100 MB."
            });
        }

        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "File upload error."
        });
    }

    if (error) {
        return res.status(400).json({
            success: false,
            message:
                error.message ||
                "File upload failed."
        });
    }

    next();
});

module.exports = router;