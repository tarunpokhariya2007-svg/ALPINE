const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const db = require("../db");

const router = express.Router();

/*
=========================================================
HELPER
=========================================================
*/

function getUserId(req) {
  return Number(req.user?.id);
}

/*
=========================================================
GET ALL CASES FOR LOGGED-IN USER
GET /api/cases
=========================================================
*/

router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid user authentication",
      });
    }

    console.log("");
    console.log("========================================");
    console.log("GET /api/cases");
    console.log("USER ID:", userId);
    console.log("========================================");

    const [rows] = await db.query(
      `
      SELECT
        id,
        user_id,
        title,
        description,
        category,
        severity,
        status,
        created_at,
        updated_at
      FROM cases
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [userId]
    );

    console.log("CASES FOUND:", rows.length);

    res.status(200).json({
      success: true,
      cases: rows,
    });
  } catch (error) {
    console.error("GET CASES ERROR:", error);

    res.status(500).json({
      success: false,
      message:
        error.message || "Failed to load cases",
    });
  }
});

/*
=========================================================
CREATE NEW CASE
POST /api/cases
=========================================================
*/

router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid user authentication",
      });
    }

    const {
      title,
      description,
      category,
      severity,
      status,
    } = req.body;

    console.log("");
    console.log("========================================");
    console.log("POST /api/cases");
    console.log("USER ID:", userId);
    console.log("TITLE:", title);
    console.log("CATEGORY:", category);
    console.log("SEVERITY:", severity);
    console.log("STATUS:", status);
    console.log("========================================");

    /*
    -------------------------------------------------------
    VALIDATE TITLE
    -------------------------------------------------------
    */

    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Case title is required",
      });
    }

    /*
    -------------------------------------------------------
    VALIDATE DESCRIPTION
    -------------------------------------------------------
    */

    if (
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Case description is required",
      });
    }

    /*
    -------------------------------------------------------
    SEVERITY
    -------------------------------------------------------
    */

    const allowedSeverities = [
      "Low",
      "Medium",
      "High",
      "Critical",
    ];

    const finalSeverity =
      allowedSeverities.includes(
        severity
      )
        ? severity
        : "Medium";

    /*
    -------------------------------------------------------
    STATUS
    -------------------------------------------------------
    */

    const allowedStatuses = [
      "open",
      "in_progress",
      "resolved",
      "closed",
    ];

    const finalStatus =
      allowedStatuses.includes(
        status
      )
        ? status
        : "open";

    /*
    -------------------------------------------------------
    CATEGORY
    -------------------------------------------------------
    */

    const finalCategory =
      typeof category === "string" &&
      category.trim()
        ? category.trim()
        : "General Legal Matter";

    /*
    -------------------------------------------------------
    INSERT INTO CASES
    -------------------------------------------------------
    */

    const [result] = await db.query(
      `
      INSERT INTO cases
      (
        user_id,
        title,
        description,
        category,
        severity,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        title.trim(),
        description.trim(),
        finalCategory,
        finalSeverity,
        finalStatus,
      ]
    );

    const caseId =
      result.insertId;

    console.log(
      "CASE CREATED SUCCESSFULLY"
    );

    console.log(
      "CASE ID:",
      caseId
    );

    /*
    -------------------------------------------------------
    GET THE NEW CASE
    -------------------------------------------------------
    */

    const [rows] = await db.query(
      `
      SELECT
        id,
        user_id,
        title,
        description,
        category,
        severity,
        status,
        created_at,
        updated_at
      FROM cases
      WHERE id = ?
      AND user_id = ?
      LIMIT 1
      `,
      [
        caseId,
        userId,
      ]
    );

    res.status(201).json({
      success: true,
      message:
        "Case created successfully",
      caseId: caseId,
      case:
        rows.length > 0
          ? rows[0]
          : null,
    });
  } catch (error) {
    console.error("");
    console.error(
      "========================================"
    );
    console.error(
      "CREATE CASE ERROR"
    );
    console.error(error);
    console.error(
      "========================================"
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to create case",
    });
  }
});

/*
=========================================================
GET SINGLE CASE
GET /api/cases/:id
=========================================================
*/

router.get(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = getUserId(req);

      const caseId =
        Number(req.params.id);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid user authentication",
        });
      }

      if (
        !Number.isInteger(caseId) ||
        caseId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid case ID",
        });
      }

      const [rows] =
        await db.query(
          `
          SELECT
            id,
            user_id,
            title,
            description,
            category,
            severity,
            status,
            created_at,
            updated_at
          FROM cases
          WHERE id = ?
          AND user_id = ?
          LIMIT 1
          `,
          [
            caseId,
            userId,
          ]
        );

      if (
        rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Case not found",
        });
      }

      res.status(200).json({
        success: true,
        case: rows[0],
      });
    } catch (error) {
      console.error(
        "GET SINGLE CASE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load case",
      });
    }
  }
);

/*
=========================================================
DELETE CASE
DELETE /api/cases/:id
=========================================================
*/

router.delete(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = getUserId(req);

      const caseId =
        Number(req.params.id);

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid user authentication",
        });
      }

      if (
        !Number.isInteger(caseId) ||
        caseId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid case ID",
        });
      }

      const [result] =
        await db.query(
          `
          DELETE FROM cases
          WHERE id = ?
          AND user_id = ?
          `,
          [
            caseId,
            userId,
          ]
        );

      if (
        result.affectedRows === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Case not found",
        });
      }

      res.status(200).json({
        success: true,
        message:
          "Case deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE CASE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete case",
      });
    }
  }
);

module.exports = router;