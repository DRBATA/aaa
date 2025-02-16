// /api/tests.js
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import "dotenv/config";

const pkg = { Pool };
const pool = new pkg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return reject(err);
      resolve(user);
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Missing token" });
    }
    const token = authHeader.split(" ")[1];
    const user = await verifyToken(token);

    const { tested_dob, test_date, test_type, test_result } = req.body;
    if (!tested_dob || !test_date || !test_type) {
      return res.status(400).json({ error: "Missing required test details" });
    }

    const newTest = await pool.query(
      "INSERT INTO tests (user_id, tested_dob, test_date, test_type, test_result) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [user.userId, tested_dob, test_date, test_type, test_result]
    );

    return res.status(201).json({ message: "Test result recorded successfully", test: newTest.rows[0] });
  } catch (err) {
    console.error("Error recording test result:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
