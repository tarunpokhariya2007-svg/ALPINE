const {
    upsertOtp,
    findOtp,
    markOtpVerified,
    incrementOtpAttempts,
    deleteOtp
} = require("../database/otpModel");

const { sendOtpEmail } = require("./mailerService");

const OTP_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 45;
const MAX_ATTEMPTS = 5;


function generateOtpCode() {
    // 6-digit numeric code, always zero-padded
    return String(Math.floor(100000 + Math.random() * 900000));
}


// =====================================================
// GENERATE + SEND OTP
// =====================================================

async function createAndSendOtp(email, purpose = "signup") {

    const existing = await findOtp(email, purpose);

    if (existing) {

        const secondsSinceUpdate =
            (Date.now() - new Date(existing.updated_at || existing.created_at).getTime()) / 1000;

        if (secondsSinceUpdate < RESEND_COOLDOWN_SECONDS) {

            const waitSeconds = Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSinceUpdate);

            const err = new Error(
                `Please wait ${waitSeconds}s before requesting another code.`
            );
            err.code = "OTP_COOLDOWN";
            err.waitSeconds = waitSeconds;
            throw err;

        }

    }

    const otpCode = generateOtpCode();

    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await upsertOtp(email, otpCode, purpose, expiresAt);

    await sendOtpEmail(email, otpCode, purpose);

    return { expiresInMinutes: OTP_TTL_MINUTES };
}


// =====================================================
// VERIFY OTP
// =====================================================

async function verifyOtpCode(email, purpose, submittedCode) {

    const row = await findOtp(email, purpose);

    if (!row) {
        const err = new Error("No verification code found for this email. Please request a new one.");
        err.code = "OTP_NOT_FOUND";
        throw err;
    }

    if (row.attempts >= MAX_ATTEMPTS) {
        const err = new Error("Too many incorrect attempts. Please request a new code.");
        err.code = "OTP_LOCKED";
        throw err;
    }

    if (new Date(row.expires_at).getTime() < Date.now()) {
        const err = new Error("This code has expired. Please request a new one.");
        err.code = "OTP_EXPIRED";
        throw err;
    }

    if (String(row.otp_code) !== String(submittedCode)) {

        await incrementOtpAttempts(email, purpose);

        const err = new Error("Incorrect code. Please try again.");
        err.code = "OTP_INCORRECT";
        throw err;
    }

    await markOtpVerified(email, purpose);

    return true;
}


// =====================================================
// CHECK IF EMAIL IS VERIFIED (used right before account creation)
// =====================================================

async function isEmailVerified(email, purpose) {

    const row = await findOtp(email, purpose);

    if (!row) return false;
    if (!row.verified) return false;
    if (new Date(row.expires_at).getTime() < Date.now()) return false;

    return true;
}


async function clearOtp(email, purpose) {
    await deleteOtp(email, purpose);
}


module.exports = {
    createAndSendOtp,
    verifyOtpCode,
    isEmailVerified,
    clearOtp
};
