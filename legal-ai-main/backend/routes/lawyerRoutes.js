const express = require("express");
const db = require("../db");

const router = express.Router();

// GET ALL REGISTERED ADVOCATES
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        full_name,
        email,
        phone,
        role,
        created_at
      FROM users
      WHERE role = 'lawyer'
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      lawyers: rows,
    });

  } catch (err) {
    console.error("GET LAWYERS ERROR:", err);

    res.status(500).json({
      success: false,
      message:
        err.message || "Failed to load advocates",
    });
  }
});

module.exports = router;