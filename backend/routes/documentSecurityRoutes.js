const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const BCRYPT_ROUNDS = 12;

// =====================================================
// PASSWORD VALIDATION
// =====================================================

function validatePassword(password) {
    if (typeof password !== "string") {
        return "Document password is required.";
    }

    if (password.length < 8) {
        return "Document password must be at least 8 characters.";
    }

    if (password.length > 128) {
        return "Document password must not exceed 128 characters.";
    }

    return null;
}

// =====================================================
// GET DOCUMENT SECURITY STATUS
// =====================================================
// Checks whether the authenticated user has created
// a Document Security Password.
//
// IMPORTANT:
// The user ID comes from the verified JWT.
// We do NOT accept userId from the browser.
// =====================================================

router.get(
    "/status",
    authMiddleware,
    async (req, res) => {
        try {
            const userId = Number(req.user.id);

            if (!Number.isInteger(userId) || userId <= 0) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid authenticated user.",
                });
            }

            const [rows] = await db.query(
                `
                SELECT id
                FROM document_security
                WHERE user_id = ?
                LIMIT 1
                `,
                [userId]
            );

            return res.json({
                success: true,
                hasPassword: rows.length > 0,
            });
        } catch (error) {
            console.error(
                "DOCUMENT SECURITY STATUS ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to check document security status.",
            });
        }
    }
);

// =====================================================
// SET DOCUMENT SECURITY PASSWORD
// =====================================================
// Used when a user does not have a Document Password.
//
// The actual password is NEVER stored.
// Only the bcrypt hash is stored.
// =====================================================

router.post(
    "/set-password",
    authMiddleware,
    async (req, res) => {
        try {
            const userId = Number(req.user.id);

            const {
                password,
                confirmPassword,
            } = req.body;

            if (!Number.isInteger(userId) || userId <= 0) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid authenticated user.",
                });
            }

            const validationError =
                validatePassword(password);

            if (validationError) {
                return res.status(400).json({
                    success: false,
                    message: validationError,
                });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Document passwords do not match.",
                });
            }

            // Check whether the user already has a password.
            const [existing] = await db.query(
                `
                SELECT id
                FROM document_security
                WHERE user_id = ?
                LIMIT 1
                `,
                [userId]
            );

            if (existing.length > 0) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Document Security Password already exists. Use the change or reset option.",
                });
            }

            // Hash the password.
            const passwordHash =
                await bcrypt.hash(
                    password,
                    BCRYPT_ROUNDS
                );

            await db.query(
                `
                INSERT INTO document_security
                (
                    user_id,
                    password_hash
                )
                VALUES (?, ?)
                `,
                [
                    userId,
                    passwordHash,
                ]
            );

            return res.status(201).json({
                success: true,
                message:
                    "Document Security Password created successfully.",
            });
        } catch (error) {
            console.error(
                "SET DOCUMENT SECURITY PASSWORD ERROR:",
                error
            );

            if (error.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    success: false,
                    message:
                        "Document Security Password already exists.",
                });
            }

            return res.status(500).json({
                success: false,
                message:
                    "Unable to create Document Security Password.",
            });
        }
    }
);

// =====================================================
// VERIFY DOCUMENT SECURITY PASSWORD
// =====================================================

router.post(
    "/verify-password",
    authMiddleware,
    async (req, res) => {
        try {
            const userId = Number(req.user.id);
            const { password } = req.body;

            if (!Number.isInteger(userId) || userId <= 0) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid authenticated user.",
                });
            }

            if (
                typeof password !== "string" ||
                password.length === 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Document Security Password is required.",
                });
            }

            const [rows] = await db.query(
                `
                SELECT password_hash
                FROM document_security
                WHERE user_id = ?
                LIMIT 1
                `,
                [userId]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    hasPassword: false,
                    message:
                        "Document Security Password has not been created yet.",
                });
            }

            const passwordMatches =
                await bcrypt.compare(
                    password,
                    rows[0].password_hash
                );

            if (!passwordMatches) {
                return res.status(401).json({
                    success: false,
                    verified: false,
                    message:
                        "Incorrect Document Security Password.",
                });
            }

            return res.json({
                success: true,
                verified: true,
                message:
                    "Document Security Password verified.",
            });
        } catch (error) {
            console.error(
                "VERIFY DOCUMENT SECURITY PASSWORD ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to verify Document Security Password.",
            });
        }
    }
);

// =====================================================
// CHANGE DOCUMENT SECURITY PASSWORD
// =====================================================
// Used when the user knows their current password.
// Email-based reset will be added separately.
// =====================================================

router.post(
    "/change-password",
    authMiddleware,
    async (req, res) => {
        try {
            const userId = Number(req.user.id);

            const {
                currentPassword,
                newPassword,
                confirmPassword,
            } = req.body;

            if (!Number.isInteger(userId) || userId <= 0) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid authenticated user.",
                });
            }

            if (
                typeof currentPassword !== "string" ||
                currentPassword.length === 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Current Document Security Password is required.",
                });
            }

            const validationError =
                validatePassword(newPassword);

            if (validationError) {
                return res.status(400).json({
                    success: false,
                    message: validationError,
                });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message:
                        "New Document Security Passwords do not match.",
                });
            }

            const [rows] = await db.query(
                `
                SELECT
                    id,
                    password_hash
                FROM document_security
                WHERE user_id = ?
                LIMIT 1
                `,
                [userId]
            );

            if (rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Document Security Password has not been created yet.",
                });
            }

            const currentPasswordMatches =
                await bcrypt.compare(
                    currentPassword,
                    rows[0].password_hash
                );

            if (!currentPasswordMatches) {
                return res.status(401).json({
                    success: false,
                    message:
                        "Current Document Security Password is incorrect.",
                });
            }

            const newPasswordHash =
                await bcrypt.hash(
                    newPassword,
                    BCRYPT_ROUNDS
                );

            await db.query(
                `
                UPDATE document_security
                SET password_hash = ?
                WHERE user_id = ?
                `,
                [
                    newPasswordHash,
                    userId,
                ]
            );

            return res.json({
                success: true,
                message:
                    "Document Security Password changed successfully.",
            });
        } catch (error) {
            console.error(
                "CHANGE DOCUMENT SECURITY PASSWORD ERROR:",
                error
            );

            return res.status(500).json({
                success: false,
                message:
                    "Unable to change Document Security Password.",
            });
        }
    }
);

module.exports = router;