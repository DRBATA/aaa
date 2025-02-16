const express = require("express");
const { Pool } = require("pg");
const { Resend } = require("resend");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Registration Endpoint
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body; // Collect name, email, and password

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing name, email, or password" });
  }

  try {
    // Check if user already exists
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "User already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user with confirmed = false
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password_hash, confirmed) VALUES ($1, $2, $3, false) RETURNING *",
      [name, email, hashedPassword]
    );

    // Notify the admin by email via Resend
    const emailData = {
      from: "onboarding@yourverifieddomain.com", // Must be verified in Resend
      to: process.env.EMAIL_USER, // Admin email (same as sender for now)
      subject: "New User Registration on EasyGP",
      html: `<p>A new user has registered:</p>
             <p><strong>Name:</strong> ${name}<br/><strong>Email:</strong> ${email}</p>
             <p>Please send them a payment link to complete their registration.</p>`
    };

    const emailResponse = await resend.emails.send(emailData);
    console.log("Resend response:", emailResponse);

    res.status(201).json({
      message: "Thank you for registering. Please await a payment link on your phone.",
      user: newUser.rows[0]
    });
  } catch (err) {
    console.error("Error in registration:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login Endpoint
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token valid for 1 year (adjust as needed)
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1y" });
    res.json({ message: "Login successful!", token, user });
  } catch (err) {
    console.error("Error in login:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
