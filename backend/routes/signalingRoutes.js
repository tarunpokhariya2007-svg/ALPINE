const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  joinRoom,
  touchParticipant,
  leaveRoom,
  addMessage,
  getMessages,
} = require("../services/signalingService");

const router = express.Router();

// Join a consultation signaling room
router.post("/:appointmentId/join", authMiddleware, (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;
    const role = req.user.role;

    const result = joinRoom(appointmentId, userId, role);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Signaling join error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to join consultation room",
    });
  }
});

// Keep participant active
router.post("/:appointmentId/heartbeat", authMiddleware, (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;

    const result = touchParticipant(appointmentId, userId);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Signaling heartbeat error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to update participant status",
    });
  }
});

// Send WebRTC signaling message
router.post("/:appointmentId/message", authMiddleware, (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;
    const { type, payload } = req.body || {};

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Message type is required",
      });
    }

    const message = addMessage(
      appointmentId,
      userId,
      type,
      payload
    );

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Signaling message error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to send signaling message",
    });
  }
});

// Get signaling messages for the current participant
router.get("/:appointmentId/messages", authMiddleware, (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;

    const messages = getMessages(appointmentId, userId);

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error("Signaling messages error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to get signaling messages",
    });
  }
});

// Leave consultation room
router.post("/:appointmentId/leave", authMiddleware, (req, res) => {
  try {
    const { appointmentId } = req.params;
    const userId = req.user.id;

    const result = leaveRoom(appointmentId, userId);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Signaling leave error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to leave consultation room",
    });
  }
});

module.exports = router;