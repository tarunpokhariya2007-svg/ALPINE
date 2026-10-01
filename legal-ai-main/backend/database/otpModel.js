const db = require("../db");

// =====================================================
// ENSURE TABLE EXISTS
// (safe to call multiple times, runs once at startup)
// =====================================================

async function ensureOtpTable() {

    const sql = `
        CREATE TABLE IF NOT EXISTS otp_verifications (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            otp_code VARCHAR(6) NOT NULL,
            purpose VARCHAR(30) NOT NULL DEFAULT 'signup',
            verified TINYINT(1) NOT NULL DEFAULT 0,
            attempts INT NOT NULL DEFAULT 0,
            expires_at DATETIME NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_email_purpose (email, purpose)
        )
    `;

    await db.query(sql);

    console.log("OTP table ready (otp_verifications).");
}


// =====================================================
// CREATE OR REPLACE OTP FOR AN EMAIL + PURPOSE
// =====================================================

async function upsertOtp(email, otpCode, purpose, expiresAt) {

    const sql = `
        INSERT INTO otp_verifications
            (email, otp_code, purpose, verified, attempts, expires_at)
        VALUES (?, ?, ?, 0, 0, ?)
        ON DUPLICATE KEY UPDATE
            otp_code = VALUES(otp_code),
            verified = 0,
            attempts = 0,
            expires_at = VALUES(expires_at)
    `;

    const [result] = await db.query(
        sql,
        [email, otpCode, purpose, expiresAt]
    );

    return result;
}


// =====================================================
// FIND OTP ROW
// =====================================================

async function findOtp(email, purpose) {

    const sql = `
        SELECT *
        FROM otp_verifications
        WHERE email = ? AND purpose = ?
        LIMIT 1
    `;

    const [rows] = await db.query(sql, [email, purpose]);

    return rows[0];
}


// =====================================================
// MARK OTP AS VERIFIED
// =====================================================

async function markOtpVerified(email, purpose) {

    const sql = `
        UPDATE otp_verifications
        SET verified = 1
        WHERE email = ? AND purpose = ?
    `;

    const [result] = await db.query(sql, [email, purpose]);

    return result;
}


// =====================================================
// INCREMENT FAILED ATTEMPTS
// =====================================================

async function incrementOtpAttempts(email, purpose) {

    const sql = `
        UPDATE otp_verifications
        SET attempts = attempts + 1
        WHERE email = ? AND purpose = ?
    `;

    const [result] = await db.query(sql, [email, purpose]);

    return result;
}


// =====================================================
// DELETE OTP (after successful signup, or cleanup)
// =====================================================

async function deleteOtp(email, purpose) {

    const sql = `
        DELETE FROM otp_verifications
        WHERE email = ? AND purpose = ?
    `;

    const [result] = await db.query(sql, [email, purpose]);

    return result;
}


module.exports = {
    ensureOtpTable,
    upsertOtp,
    findOtp,
    markOtpVerified,
    incrementOtpAttempts,
    deleteOtp
};
