const db = require("../db");
const { MAX_USER_STORAGE_BYTES } = require("../config/uploadConfig");

// =====================================================
// ENSURE DOCUMENT STORAGE SUPPORT
//
// Adds a file_size column to the existing `documents`
// table if it isn't already there. This mirrors the
// idempotent "ensure*" pattern already used in
// userModel.js (ensureGoogleAuthSupport) / otpModel.js,
// so it's safe to call on every server start and never
// touches/erases existing rows.
//
// Existing documents (uploaded before this change) will
// simply default to file_size = 0, which means they
// don't count against the user's quota until re-uploaded.
// This is the safest option: we have no reliable way to
// know the real historical size of a file that was never
// recorded, and refusing to guess avoids corrupting the
// quota calculation.
// =====================================================

async function ensureDocumentStorageSupport() {
    const [columns] = await db.query(
        `
            SELECT COLUMN_NAME
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'documents'
              AND COLUMN_NAME = 'file_size'
        `
    );

    if (columns.length === 0) {
        await db.query(
            `ALTER TABLE documents ADD COLUMN file_size BIGINT NOT NULL DEFAULT 0`
        );

        console.log("Added file_size column to documents table.");
    }

    console.log("Document storage quota support ready (documents table).");
}

// =====================================================
// GET TOTAL STORAGE USED BY A USER (bytes)
// =====================================================

async function getUserStorageUsed(userId, connection = db) {
    const [rows] = await connection.query(
        `
            SELECT COALESCE(SUM(file_size), 0) AS used
            FROM documents
            WHERE user_id = ?
        `,
        [userId]
    );

    return Number(rows[0].used) || 0;
}

// =====================================================
// RUN A CALLBACK WHILE HOLDING A PER-USER NAMED LOCK
//
// MySQL named locks (GET_LOCK / RELEASE_LOCK) are
// connection-scoped, so we check out a single dedicated
// connection from the pool for the whole
// check-then-insert sequence. This prevents the classic
// concurrent-upload race (two uploads both reading
// "45 MB used" before either one writes, and both being
// allowed through) without needing a new lock table or
// SELECT ... FOR UPDATE against a row that might not
// exist yet for a brand-new user.
// =====================================================

async function withUserStorageLock(userId, callback) {
    const connection = await db.getConnection();
    const lockName = `doc_storage_user_${userId}`;

    try {
        // Wait up to 10s for the lock (covers normal concurrent
        // upload bursts without hanging requests indefinitely).
        const [lockRows] = await connection.query(
            "SELECT GET_LOCK(?, 10) AS acquired",
            [lockName]
        );

        if (!lockRows[0] || lockRows[0].acquired !== 1) {
            throw new Error(
                "Could not acquire storage lock. Please try again."
            );
        }

        return await callback(connection);
    } finally {
        try {
            await connection.query("SELECT RELEASE_LOCK(?)", [lockName]);
        } catch (releaseErr) {
            console.error("RELEASE_LOCK ERROR:", releaseErr.message);
        }
        connection.release();
    }
}

// =====================================================
// GET STORAGE SUMMARY (used / limit / remaining)
// =====================================================

async function getUserStorageSummary(userId) {
    const used = await getUserStorageUsed(userId);
    const limit = MAX_USER_STORAGE_BYTES;
    const remaining = Math.max(limit - used, 0);

    return { used, limit, remaining };
}

module.exports = {
    ensureDocumentStorageSupport,
    getUserStorageUsed,
    getUserStorageSummary,
    withUserStorageLock,
};
