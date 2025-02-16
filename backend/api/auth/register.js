// /api/auth/register.js
import { Pool } from "pg";
import { Resend } from "resend";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing name, email, or password" });
  }

  try {
    // Check if the user already exists
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "User already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Optionally generate a confirmation token if needed later
    const token = crypto.randomBytes(20).toString("hex");

    // Insert the new user into the database (confirmed remains false until payment)
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password_hash, confirmed) VALUES ($1, $2, $3, false) RETURNING *",
      [name, email, hashedPassword]
    );

    // Prepare email data to notify the admin
    const emailData = {
      from: "onboarding@yourverifieddomain.com", // This sender must be verified in Resend
      to: process.env.EMAIL_USER, // Admin notification (your email)
      subject: "New User Registration on EasyGP",
      html: `<p>A new user has registered:</p>
             <p><strong>Name:</strong> ${name}<br/><strong>Email:</strong> ${email}</p>
             <p>Please send them a payment link to complete their registration.</p>`
    };

    // Send email via Resend
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
