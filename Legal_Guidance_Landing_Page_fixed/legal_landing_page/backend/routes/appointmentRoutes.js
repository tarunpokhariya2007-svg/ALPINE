const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

async function ensureAppointmentsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      citizen_id INT NOT NULL,
      advocate_id INT NOT NULL,
      appointment_date DATE NOT NULL,
      appointment_time VARCHAR(30) NOT NULL,
      mode VARCHAR(20) NOT NULL DEFAULT 'video',
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_citizen_id (citizen_id),
      INDEX idx_advocate_id (advocate_id),
      INDEX idx_appointment_date (appointment_date)
    )
  `);
}

// Create an appointment as a citizen.
router.post("/", authMiddleware, async (req, res) => {
  try {
    await ensureAppointmentsTable();

    const citizenId = Number(req.user.id);
    const { advocateId, date, time, mode = "video" } = req.body;

    if (!citizenId) {
      return res.status(401).json({ success: false, message: "Invalid user" });
    }

    if (!advocateId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "Advocate, date and time are required",
      });
    }

    if (!/^(video|inperson)$/.test(mode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid consultation mode",
      });
    }

    if (Number(advocateId) === citizenId) {
      return res.status(400).json({
        success: false,
        message: "You cannot book an appointment with yourself",
      });
    }

    const [advocates] = await db.query(
      `SELECT id, full_name, email, phone, role FROM users WHERE id = ? AND role = 'lawyer' LIMIT 1`,
      [Number(advocateId)]
    );

    if (!advocates.length) {
      return res.status(404).json({
        success: false,
        message: "Advocate not found",
      });
    }

    // Do not allow two bookings for the same advocate/date/time.
    const [existing] = await db.query(
      `SELECT id FROM appointments
       WHERE advocate_id = ?
         AND appointment_date = ?
         AND appointment_time = ?
         AND status <> 'declined'
       LIMIT 1`,
      [Number(advocateId), date, time]
    );

    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: "This time slot is already booked",
      });
    }

    const [result] = await db.query(
      `INSERT INTO appointments
       (citizen_id, advocate_id, appointment_date, appointment_time, mode, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [citizenId, Number(advocateId), date, time, mode]
    );

    const [rows] = await db.query(
      `SELECT
         a.id,
         a.appointment_date AS date,
         a.appointment_time AS time,
         a.mode,
         a.status,
         a.created_at,
         c.id AS citizen_id,
         c.full_name AS citizen_name,
         c.email AS citizen_email,
         l.id AS advocate_id,
         l.full_name AS advocate_name,
         l.email AS advocate_email,
         l.phone AS advocate_phone
       FROM appointments a
       JOIN users c ON c.id = a.citizen_id
       JOIN users l ON l.id = a.advocate_id
       WHERE a.id = ?
       LIMIT 1`,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment: rows[0],
    });
  } catch (err) {
    console.error("CREATE APPOINTMENT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to book appointment",
    });
  }
});

// Get appointments belonging to the logged-in user.
// Citizens receive their bookings; advocates receive bookings made with them.
router.get("/", authMiddleware, async (req, res) => {
  try {
    await ensureAppointmentsTable();

    const userId = Number(req.user.id);
    const isLawyer = req.user.role === "lawyer";

    const [rows] = await db.query(
      `SELECT
         a.id,
         a.appointment_date AS date,
         a.appointment_time AS time,
         a.mode,
         a.status,
         a.created_at,
         c.id AS citizen_id,
         c.full_name AS citizen_name,
         c.email AS citizen_email,
         c.phone AS citizen_phone,
         l.id AS advocate_id,
         l.full_name AS advocate_name,
         l.email AS advocate_email,
         l.phone AS advocate_phone
       FROM appointments a
       JOIN users c ON c.id = a.citizen_id
       JOIN users l ON l.id = a.advocate_id
       WHERE ${isLawyer ? "a.advocate_id" : "a.citizen_id"} = ?
       ORDER BY a.appointment_date ASC, a.created_at DESC`,
      [userId]
    );

    return res.json({ success: true, appointments: rows });
  } catch (err) {
    console.error("GET APPOINTMENTS ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to load appointments",
    });
  }
});

// Advocate can confirm or decline a pending booking.
router.patch("/:id/status", authMiddleware, async (req, res) => {
  try {
    await ensureAppointmentsTable();

    if (req.user.role !== "lawyer") {
      return res.status(403).json({ success: false, message: "Only advocates can update appointments" });
    }

    const appointmentId = Number(req.params.id);
    const { status } = req.body;

    if (!appointmentId || !["confirmed", "declined"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid appointment or status" });
    }

    const [result] = await db.query(
      `UPDATE appointments
       SET status = ?
       WHERE id = ? AND advocate_id = ?`,
      [status, appointmentId, Number(req.user.id)]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    return res.json({
      success: true,
      message: `Appointment ${status}`,
    });
  } catch (err) {
    console.error("UPDATE APPOINTMENT ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to update appointment",
    });
  }
});

module.exports = router;
