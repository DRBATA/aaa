const express = require("express");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Missing token" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
}

// Endpoint to add a new test result
router.post("/", authenticateToken, async (req, res) => {
  const { tested_dob, test_date, test_type, test_result } = req.body;
  // Validate required fields
  if (!tested_dob || !test_date || !test_type) {
    return res.status(400).json({ error: "Missing required test details" });
  }

  try {
    // req.user.userId is set from the JWT payload
    const newTest = await pool.query(
      "INSERT INTO tests (user_id, tested_dob, test_date, test_type, test_result) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [req.user.userId, tested_dob, test_date, test_type, test_result]
    );
    res.status(201).json({ message: "Test result recorded successfully", test: newTest.rows[0] });
  } catch (err) {
    console.error("Error recording test result:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
