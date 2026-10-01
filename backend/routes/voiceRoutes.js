const express = require("express");
const multer = require("multer");
const { speechToText, textToSpeech } = require("../services/sarvamService");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Keep recorded audio in memory only — no need to persist it to disk
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/voice/stt  — audio in, transcript out
router.post("/stt", authMiddleware, upload.single("audio"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No audio file uploaded",
            });
        }

        const languageCode = req.body.language_code || "unknown";

        const result = await speechToText(
            req.file.buffer,
            req.file.originalname || "recording.webm",
            languageCode
        );

        res.json({
            success: true,
            transcript: result.transcript,
            languageCode: result.languageCode,
        });

    } catch (err) {
    console.error("STT ERROR:", err);
    res.status(500).json({
        success: false,
        message: err?.message || "Speech-to-text failed",
    });
}
});

// POST /api/voice/tts  — text in, base64 audio out
router.post("/tts", authMiddleware, async (req, res) => {
    try {
        const { text, language_code, speaker } = req.body;

        if (!text || !text.trim()) {
            return res.status(400).json({
                success: false,
                message: "No text provided",
            });
        }

        const audioBase64 = await textToSpeech(
            text,
            language_code || "en-IN",
            speaker
        );

        res.json({
            success: true,
            audio: audioBase64, // base64 WAV — frontend builds a data: URL from this
        });

    } catch (err) {
        console.error("TTS ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Text-to-speech failed",
        });
    }
});

module.exports = router;
