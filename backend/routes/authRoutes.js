const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authMiddleware = require("../middleware/authMiddleware");

const {
    createUser,
    createGoogleUser,
    linkGoogleId,
    findUserByGoogleId,
    findUserByEmail,
    findUserById,
    updateUserProfile,
    updateUserPassword
} = require("../database/userModel");

const {
    createAndSendOtp,
    createAndSendPasswordResetOtp,
    verifyOtpCode,
    isEmailVerified,
    clearOtp
} = require("../services/otpService");

const { fetchGoogleProfile } = require("../services/googleAuthService");
const { sendPasswordResetOtpEmail } = require("../services/mailerService");

const router = express.Router();

const JWT_SECRET = "nyaya_secret_key";

const SIGNUP_OTP_PURPOSE = "signup";


// =====================================================
// SEND SIGNUP OTP
// POST /api/auth/signup/send-otp
// body: { email }
// =====================================================

router.post("/signup/send-otp", async (req, res) => {

    try {

        const { email } = req.body;

        if (!email || !email.trim()) {

            return res.status(400).json({
                success: false,
                message: "Email is required."
            });

        }

        const cleanEmail = email.trim().toLowerCase();

        const existingUser = await findUserByEmail(cleanEmail);

        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "Email already registered. Please sign in instead."
            });

        }

        const result = await createAndSendOtp(cleanEmail, SIGNUP_OTP_PURPOSE);

        res.json({
            success: true,
            message: `Verification code sent to ${cleanEmail}.`,
            expiresInMinutes: result.expiresInMinutes
        });

    } catch (err) {

        console.error("SEND OTP ERROR:", err);

        if (err.code === "OTP_COOLDOWN") {

            return res.status(429).json({
                success: false,
                message: err.message,
                waitSeconds: err.waitSeconds
            });

        }

        res.status(500).json({
            success: false,
            message: err.message || "Failed to send verification code."
        });

    }

});


// =====================================================
// VERIFY SIGNUP OTP
// POST /api/auth/signup/verify-otp
// body: { email, otp }
// =====================================================

router.post("/signup/verify-otp", async (req, res) => {

    try {

        const { email, otp } = req.body;

        if (!email || !otp) {

            return res.status(400).json({
                success: false,
                message: "Email and code are required."
            });

        }

        const cleanEmail = email.trim().toLowerCase();

        await verifyOtpCode(cleanEmail, SIGNUP_OTP_PURPOSE, String(otp).trim());

        res.json({
            success: true,
            message: "Email verified successfully."
        });

    } catch (err) {

        console.error("VERIFY OTP ERROR:", err);

        const statusMap = {
            OTP_NOT_FOUND: 400,
            OTP_LOCKED: 429,
            OTP_EXPIRED: 400,
            OTP_INCORRECT: 400
        };

        res.status(statusMap[err.code] || 500).json({
            success: false,
            message: err.message || "Failed to verify code.",
            code: err.code
        });

    }

});


// =====================================================
// SIGNUP
// POST /api/auth/signup
// Requires the email to have been verified via OTP first.
// =====================================================

router.post("/signup", async (req, res) => {

    try {

        const {
            fullName,
            email,
            password,
            phone,
            role
        } = req.body;

        if (!fullName || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Full name, email and password are required."
            });

        }

        const cleanEmail = email.trim().toLowerCase();

        const existingUser =
            await findUserByEmail(cleanEmail);

        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "Email already registered."
            });

        }

        const emailVerified =
            await isEmailVerified(cleanEmail, SIGNUP_OTP_PURPOSE);

        if (!emailVerified) {

            return res.status(403).json({
                success: false,
                message: "Please verify your email with the OTP sent to it before creating an account."
            });

        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        // Advocate = lawyer
        // Citizen = citizen
        const userRole =
            role === "lawyer"
                ? "lawyer"
                : "citizen";

        const result =
            await createUser(
                fullName.trim(),
                cleanEmail,
                hashedPassword,
                phone ? phone.trim() : "",
                userRole
            );

        // OTP has served its purpose — remove it so it can't be reused.
        await clearOtp(cleanEmail, SIGNUP_OTP_PURPOSE);

        res.status(201).json({

            success: true,

            message: "Signup Successful",

            user: {
                id: result.insertId,
                fullName: fullName.trim(),
                email: cleanEmail,
                phone: phone ? phone.trim() : "",
                role: userRole
            }

        });

    } catch (err) {

        console.error("SIGNUP ERROR:", err);

        res.status(500).json({

            success: false,

            message:
                err.message ||
                "Signup failed"

        });

    }

});


// =====================================================
// GOOGLE SIGN-IN / SIGN-UP
// POST /api/auth/google
// body: { accessToken, role }  (role only used if a new account is created)
// =====================================================

router.post("/google", async (req, res) => {

    try {

        const { accessToken, role } = req.body;

        const profile = await fetchGoogleProfile(accessToken);

        let user = await findUserByGoogleId(profile.googleId);

        if (!user) {

            // No account linked to this Google ID yet —
            // check if this email already has a password account.
            user = await findUserByEmail(profile.email);

            if (user) {

                // Existing email/password account — link Google to it.
                await linkGoogleId(user.id, profile.googleId);

            } else {

                // Brand new user, signing up via Google.
                const userRole = role === "lawyer" ? "lawyer" : "citizen";

                const result = await createGoogleUser(
                    profile.name,
                    profile.email,
                    profile.googleId,
                    userRole
                );

                user = await findUserById(result.insertId);
                user.role = userRole;
                user.full_name = profile.name;
                user.email = profile.email;

            }

        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({

            success: true,

            token,

            user: {
                id: user.id,
                fullName: user.full_name,
                email: user.email,
                phone: user.phone || "",
                role: user.role
            }

        });

    } catch (err) {

        console.error("GOOGLE AUTH ERROR:", err);

        const statusMap = {
            GOOGLE_TOKEN_MISSING: 400,
            GOOGLE_TOKEN_INVALID: 401,
            GOOGLE_EMAIL_UNVERIFIED: 403
        };

        res.status(statusMap[err.code] || 500).json({
            success: false,
            message: err.message || "Google sign-in failed."
        });

    }

});


// =====================================================
// FORGOT PASSWORD — SEND OTP
// POST /api/auth/forgot-password/send-otp
// body: { email, role }
// role: citizen | lawyer
// =====================================================

router.post("/forgot-password/send-otp", async (req, res) => {

    try {

        const { email, role } = req.body;

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email is required."
            });
        }

        const requestedRole = role === "lawyer" ? "lawyer" : "citizen";
        const cleanEmail = email.trim().toLowerCase();
        const user = await findUserByEmail(cleanEmail);

        // Do not reveal whether an email exists for the wrong portal.
        if (!user || user.role !== requestedRole) {
            return res.status(404).json({
                success: false,
                message: requestedRole === "lawyer"
                    ? "No advocate account was found with this email."
                    : "No citizen account was found with this email."
            });
        }

        const purpose = "password_reset";
        const result = await createAndSendPasswordResetOtp(cleanEmail, requestedRole);

        // The OTP service stores the code. This second email sender uses the
        // same code only when the service exposes it, so for reset we generate
        // through a dedicated path below.
        res.json({
            success: true,
            message: `Password reset code sent to ${cleanEmail}.`,
            expiresInMinutes: result.expiresInMinutes
        });

    } catch (err) {

        console.error("SEND PASSWORD RESET OTP ERROR:", err);

        if (err.code === "OTP_COOLDOWN") {
            return res.status(429).json({
                success: false,
                message: err.message,
                waitSeconds: err.waitSeconds
            });
        }

        res.status(500).json({
            success: false,
            message: err.message || "Failed to send password reset code."
        });
    }

});


// =====================================================
// FORGOT PASSWORD — VERIFY OTP
// POST /api/auth/forgot-password/verify-otp
// body: { email, otp, role }
// =====================================================

router.post("/forgot-password/verify-otp", async (req, res) => {

    try {

        const { email, otp, role } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and verification code are required."
            });
        }

        const requestedRole = role === "lawyer" ? "lawyer" : "citizen";
        const cleanEmail = email.trim().toLowerCase();
        const user = await findUserByEmail(cleanEmail);

        if (!user || user.role !== requestedRole) {
            return res.status(404).json({
                success: false,
                message: "Account not found for this portal."
            });
        }

        await verifyOtpCode(
            cleanEmail,
            "password_reset",
            String(otp).trim()
        );

        res.json({
            success: true,
            message: "Code verified. You can now create a new password."
        });

    } catch (err) {

        console.error("VERIFY PASSWORD RESET OTP ERROR:", err);

        const status = [
            "OTP_NOT_FOUND",
            "OTP_LOCKED",
            "OTP_EXPIRED",
            "OTP_INCORRECT"
        ].includes(err.code) ? 400 : 500;

        res.status(status).json({
            success: false,
            message: err.message || "Verification failed."
        });
    }

});


// =====================================================
// FORGOT PASSWORD — SET NEW PASSWORD
// POST /api/auth/forgot-password/reset
// body: { email, newPassword, role }
// =====================================================

router.post("/forgot-password/reset", async (req, res) => {

    try {

        const { email, newPassword, role } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email and new password are required."
            });
        }

        if (String(newPassword).length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters."
            });
        }

        const requestedRole = role === "lawyer" ? "lawyer" : "citizen";
        const cleanEmail = email.trim().toLowerCase();
        const user = await findUserByEmail(cleanEmail);

        if (!user || user.role !== requestedRole) {
            return res.status(404).json({
                success: false,
                message: "Account not found for this portal."
            });
        }

        const resetOtp = await require("../database/otpModel").findOtp(
            cleanEmail,
            "password_reset"
        );

        if (!resetOtp || !resetOtp.verified) {
            return res.status(400).json({
                success: false,
                message: "Please verify the password reset code first."
            });
        }

        if (new Date(resetOtp.expires_at).getTime() < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "The verification code has expired. Please request a new one."
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await updateUserPassword(user.id, hashedPassword);
        await clearOtp(cleanEmail, "password_reset");

        res.json({
            success: true,
            message: "Password changed successfully. You can now sign in."
        });

    } catch (err) {

        console.error("RESET PASSWORD ERROR:", err);

        res.status(500).json({
            success: false,
            message: err.message || "Failed to reset password."
        });
    }

});


// =====================================================
// CITIZEN LOGIN
// POST /api/auth/login
// =====================================================

router.post("/login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required."

            });

        }

        const user =
            await findUserByEmail(
                email.trim()
            );

        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "User not found"

            });

        }

        const valid =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!valid) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid password"

            });

        }

        // IMPORTANT:
        // Normal login is only for citizens.
        if (user.role !== "citizen") {

            return res.status(403).json({

                success: false,

                message:
                    "This account is not registered as a citizen."

            });

        }

        const token =
            jwt.sign(

                {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },

                JWT_SECRET,

                {
                    expiresIn: "7d"
                }

            );

        res.json({

            success: true,

            token,

            user: {

                id:
                    user.id,

                fullName:
                    user.full_name,

                email:
                    user.email,

                phone:
                    user.phone || "",

                role:
                    user.role

            }

        });

    } catch (err) {

        console.error("CITIZEN LOGIN ERROR:", err);

        res.status(500).json({

            success: false,

            message:
                err.message ||
                "Login failed"

        });

    }

});


// =====================================================
// ADVOCATE LOGIN
// POST /api/auth/advocate-login
// =====================================================

router.post("/advocate-login", async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required."

            });

        }

        const user =
            await findUserByEmail(
                email.trim()
            );

        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "User not found"

            });

        }

        const valid =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!valid) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid password"

            });

        }

        // IMPORTANT:
        // Advocate login ONLY accepts lawyer accounts.
        if (user.role !== "lawyer") {

            return res.status(403).json({

                success: false,

                message:
                    "This account is not registered as an advocate."

            });

        }

        const token =
            jwt.sign(

                {
                    id: user.id,
                    email: user.email,
                    role: user.role
                },

                JWT_SECRET,

                {
                    expiresIn: "7d"
                }

            );

        res.json({

            success: true,

            token,

            user: {

                id:
                    user.id,

                fullName:
                    user.full_name,

                email:
                    user.email,

                phone:
                    user.phone || "",

                role:
                    user.role

            }

        });

    } catch (err) {

        console.error(
            "ADVOCATE LOGIN ERROR:",
            err
        );

        res.status(500).json({

            success: false,

            message:
                err.message ||
                "Advocate login failed"

        });

    }

});


// =====================================================
// GET CURRENT USER PROFILE
// GET /api/auth/profile
// =====================================================

router.get(
    "/profile",
    authMiddleware,
    async (req, res) => {

        try {

            const user =
                await findUserById(
                    req.user.id
                );

            if (!user) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found"

                });

            }

            res.json({

                success: true,

                user: {

                    id:
                        user.id,

                    fullName:
                        user.full_name,

                    email:
                        user.email,

                    phone:
                        user.phone || "",

                    role:
                        user.role

                }

            });

        } catch (err) {

            console.error(
                "GET PROFILE ERROR:",
                err
            );

            res.status(500).json({

                success: false,

                message:
                    err.message ||
                    "Failed to load profile"

            });

        }

    }
);


// =====================================================
// UPDATE PROFILE
// PUT /api/auth/profile
// =====================================================

router.put(
    "/profile",
    authMiddleware,
    async (req, res) => {

        try {

            const {
                fullName,
                email,
                phone
            } = req.body;

            if (!fullName || !fullName.trim()) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Full name is required."

                });

            }

            const cleanName =
                fullName.trim();

            const cleanEmail =
                email.trim();

            const cleanPhone =
                phone
                    ? phone.trim()
                    : "";

            const existingUser =
                await findUserByEmail(
                    cleanEmail
                );

            if (
                existingUser &&
                Number(existingUser.id) !==
                Number(req.user.id)
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "This email is already registered by another user."

                });

            }

            const result =
                await updateUserProfile(

                    req.user.id,

                    cleanName,

                    cleanEmail,

                    cleanPhone

                );

            if (
                result.affectedRows === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        "User not found or no changes were made."

                });

            }

            const updatedUser =
                await findUserById(
                    req.user.id
                );

            res.json({

                success: true,

                message:
                    "Profile updated successfully.",

                user: {

                    id:
                        updatedUser.id,

                    fullName:
                        updatedUser.full_name,

                    email:
                        updatedUser.email,

                    phone:
                        updatedUser.phone || "",

                    role:
                        updatedUser.role

                }

            });

        } catch (err) {

            console.error(
                "UPDATE PROFILE ERROR:",
                err
            );

            if (
                err.code ===
                "ER_DUP_ENTRY"
            ) {

                return res.status(409).json({

                    success: false,

                    message:
                        "This email is already registered."

                });

            }

            res.status(500).json({

                success: false,

                message:
                    err.message ||
                    "Failed to update profile"

            });

        }

    }
);


module.exports = router;                                                                                                            