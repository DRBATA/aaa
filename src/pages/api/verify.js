// pages/api/verify.js
import { Pool } from "pg";
import jwt from "jsonwebtoken";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: "Missing token." });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const email = decoded.email;

    // Update the user's record to mark them as verified.
    const query = "UPDATE waitlist SET verified = true WHERE email = $1";
    await pool.query(query, [email]);

    return res
      .status(200)
      .json({ message: "Email verified successfully! Thank you." });
  } catch (error) {
    console.error("Error in verify API:", error);
    return res.status(400).json({ error: "Invalid or expired token." });
  }
}
