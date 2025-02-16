// /api/auth/register.js
import pkg from 'pg';
const { Pool } = pkg;
import { Resend } from 'resend';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  console.log("Registration endpoint triggered");

  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, password } = req.body;
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

    // (Optional) Generate a confirmation token if needed later
    const token = crypto.randomBytes(20).toString("hex");

    // Insert new user into the database (confirmed remains false until payment)
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password_hash, confirmed) VALUES ($1, $2, $3, false) RETURNING *",
      [name, email, hashedPassword]
    );

    // Prepare email data to notify the admin
    const emailData = {
      from: "dr@easygp.com", // Using your verified sender email
      to: process.env.EMAIL_USER, // Admin email (should also be dr@easygp.com if that's your admin)
      subject: "New User Registration on EasyGP",
      html: `<p>A new user has registered:</p>
             <p><strong>Name:</strong> ${name}<br/><strong>Email:</strong> ${email}</p>
             <p>Please send them a payment link to complete their registration.</p>`
    };

    // Send the email via Resend
    const emailResponse = await resend.emails.send(emailData);
    console.log("Resend response:", emailResponse);

    return res.status(201).json({
      message: "Thank you for registering. Please await a payment link on your phone.",
      user: newUser.rows[0]
    });
  } catch (err) {
    console.error("Error in registration:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
