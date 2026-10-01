require("dotenv").config();

console.log("=================================");
console.log("DATABASE CONFIGURATION");
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("=================================");

const express = require("express");
const cors = require("cors");

// =====================================================
// DATABASE
// =====================================================

require("./db");

// =====================================================
// ENSURE OTP TABLE EXISTS
// =====================================================

const { ensureOtpTable } = require("./database/otpModel");
const { ensureGoogleAuthSupport } = require("./database/userModel");
const { ensureDocumentStorageSupport } = require("./database/documentModel");

ensureOtpTable().catch((err) => {
    console.error("Failed to ensure otp_verifications table:", err.message);
});

ensureGoogleAuthSupport().catch((err) => {
    console.error("Failed to ensure Google auth support:", err.message);
});

ensureDocumentStorageSupport().catch((err) => {
    console.error("Failed to ensure document storage support:", err.message);
});

// =====================================================
// ROUTES
// =====================================================

const uploadRoutes = require("./routes/uploadRoutes");
const authRoutes = require("./routes/authRoutes");
const lawyerRoutes = require("./routes/lawyerRoutes");
const voiceRoutes = require("./routes/voiceRoutes");
const chatRoutes = require("./routes/chatRoutes");
const caseRoutes = require("./routes/caseRoutes");
const profileRoutes = require("./routes/profileRoutes");

// =====================================================
// MIDDLEWARE / AGENTS
// =====================================================

const authMiddleware = require("./middleware/authMiddleware");
const masterAgent = require("./agents/masterAgent");

// =====================================================
// APP
// =====================================================

const app = express();
app.get("/___NYAYA_DEBUG___", (req, res) => {
    console.log("🔥🔥🔥 NYAYA DEBUG ROUTE HIT 🔥🔥🔥");

    res.status(200).json({
        success: true,
        message: "THIS IS THE SERVER.JS YOU ARE RUNNING",
        time: new Date().toISOString()
    });
});

// =====================================================
// CORS
// =====================================================

app.use(
    cors({
        origin: true,
        credentials: true
    })
);

// =====================================================
// BODY PARSERS
// =====================================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================================
// STATIC UPLOADS
// =====================================================

app.use(
    "/uploads",
    express.static("uploads")
);

// =====================================================
// API ROUTES
// =====================================================

// Upload
app.use(
    "/api",
    uploadRoutes
);

// Authentication
app.use(
    "/api/auth",
    authRoutes
);

// Voice
app.use(
    "/api/voice",
    voiceRoutes
);

// Lawyers / Advocates
app.use(
    "/api/lawyers",
    lawyerRoutes
);

// AI Chat
app.use(
    "/api/chat",
    chatRoutes
);

// Cases
app.use(
    "/api/cases",
    caseRoutes
);

// User Profile
app.use(
    "/api/profile",
    profileRoutes
);
console.log("******** PROFILE ROUTES MOUNTED ********");
app.get("/api/profile-direct-test", (req, res) => {
    console.log("DIRECT PROFILE TEST HIT");

    res.json({
        success: true,
        message: "Server profile route works directly"
    });
});

// =====================================================
// BACKEND TEST
// =====================================================

app.get("/test", (req, res) => {

    res.json({
        success: true,
        message: "Backend is working!"
    });

});

// =====================================================
// AI CASE ANALYSIS
// =====================================================

app.post(
    "/analyze",
    authMiddleware,
    async (req, res) => {

        try {

            console.log("=================================");
            console.log("ANALYZE REQUEST RECEIVED");
            console.log("USER ID:", req.user.id);
            console.log("=================================");

            const result = await masterAgent({
                ...req.body,
                userId: req.user.id
            });

            res.json(result);

        } catch (err) {

            console.error(
                "ANALYZE ERROR:",
                err
            );

            res.status(500).json({
                success: false,
                response: "Backend Error",
                message:
                    err.message ||
                    "Failed to analyze case"
            });

        }

    }
);

// =====================================================
// 404 HANDLER
// =====================================================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "API endpoint not found",

            path:
                req.originalUrl

        });

    }
);

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use(
    (err, req, res, next) => {

        console.error(
            "================================="
        );

        console.error(
            "GLOBAL SERVER ERROR:"
        );

        console.error(err);

        console.error(
            "================================="
        );

        res.status(500).json({

            success: false,

            message:
                err.message ||
                "Internal server error"

        });

    }
);

// =====================================================
// START SERVER
// =====================================================

const PORT =
    process.env.PORT || 5001;

app.listen(
    PORT,
    () => {

        console.log("=================================");
        console.log("NYAYA AI BACKEND");
        console.log("=================================");

        console.log(
            `Server running on http://localhost:${PORT}`
        );

        console.log(
            `Test API: http://localhost:${PORT}/test`
        );

        console.log(
            `Auth API: http://localhost:${PORT}/api/auth`
        );

        console.log(
            `Profile API: http://localhost:${PORT}/api/profile`
        );

        console.log(
            `Cases API: http://localhost:${PORT}/api/cases`
        );

        console.log(
            `Lawyers API: http://localhost:${PORT}/api/lawyers`
        );

        console.log(
            `Chat API: http://localhost:${PORT}/api/chat`
        );

        console.log("=================================");

    }
);