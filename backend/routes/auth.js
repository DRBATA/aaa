const express = require("express");
const { Pool } = require("pg");
const { Resend } = require("resend");
const crypto = require("crypto");
require("dotenv").config();

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// -------------------- Registration Endpoint --------------------
// This endpoint registers a new user, generates a confirmation token,
// and sends a confirmation email using Resend.
router.post("/register", async (req, res) => {
  const { email } = req.body; // Minimal: only email is needed

  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  try {
    // Check if user already exists
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "User already registered" });
    }

    // Generate a random confirmation token
    const token = crypto.randomBytes(20).toString("hex");

    // Insert new user with confirmed = false and store the confirmation token.
    const newUser = await pool.query(
      "INSERT INTO users (email, confirmed, confirmation_token) VALUES ($1, false, $2) RETURNING *",
      [email, token]
    );

    // Build confirmation URL using production variable BASE_URL.
    // In development you might set BASE_URL=http://localhost:5000
    // In production, set BASE_URL to your public API URL (e.g. https://easygp.vercel.app)
    const confirmationUrl = `${process.env.BASE_URL}/api/auth/confirm?token=${token}`;

    // Prepare the email data using your verified sender (set in your Resend account)
    const emailData = {
      from: "onboarding@yourverifieddomain.com", // Must be a verified sender
      to: email,
      subject: "Confirm your email for EasyGP",
      html: `<p>Hi there! Thanks for registering with EasyGP.</p>
             <p>Please confirm your email by clicking <a href="${confirmationUrl}">this link</a>.</p>`
    };

    // Send the confirmation email using Resend
    const response = await resend.emails.send(emailData);
    console.log("Resend response:", response);

    res.status(201).json({
      message: "User registered successfully. Please check your email to confirm your account.",
      user: newUser.rows[0]
    });
  } catch (err) {
    console.error("Error in registration:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// -------------------- Confirmation Endpoint --------------------
router.get("/confirm", async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).send("Missing token");
  }

  try {
    // Find the user with the given confirmation token.
    const result = await pool.query("SELECT * FROM users WHERE confirmation_token = $1", [token]);
    if (result.rows.length === 0) {
      return res.status(400).send("Invalid token");
    }

    // Mark the user as confirmed and clear the token.
    await pool.query("UPDATE users SET confirmed = true, confirmation_token = NULL WHERE id = $1", [result.rows[0].id]);
    res.send("Email confirmed successfully! You can now log in.");
  } catch (err) {
    console.error("Error in confirmation:", err);
    res.status(500).send("Internal server error");
  }
});

// Minimal Login Endpoint (placeholder)
router.post("/login", async (req, res) => {
  res.json({ message: "Login endpoint not implemented in this minimal version." });
});

module.exports = router;
