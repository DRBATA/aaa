// /api/auth/register.js
import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  console.log("Registration endpoint triggered");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing name, email, or password" });
  }

  try {
    // Check if the email is already registered
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "User already registered" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user with confirmed set to true (no follow‑up email)
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password_hash, confirmed) VALUES ($1, $2, $3, true) RETURNING *",
      [name, email, hashedPassword]
    );

    return res.status(201).json({
      message: "User registered successfully!",
      user: newUser.rows[0]
    });
  } catch (err) {
    console.error("Error in registration:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
