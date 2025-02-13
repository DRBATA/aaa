// pages/api/waitlist.js
import { Pool } from "pg";
import jwt from "jsonwebtoken";
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const SECRET_KEY = process.env.JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "Missing name or email." });
  }

  try {
    // Insert the new waitlist signup into the database.
    // (Assuming you have a table "waitlist" with columns: id, name, email, verified, created_at)
    const query =
      "INSERT INTO waitlist (name, email, verified) VALUES ($1, $2, $3) RETURNING id";
    const values = [name, email, false];
    await pool.query(query, values);

    // Generate a verification token that expires in 1 hour.
    const token = jwt.sign({ email }, SECRET_KEY, { expiresIn: "1h" });

    // Build the verification link.
    const verificationLink = `${process.env.BASE_URL}/api/verify?token=${token}`;

    // Send the verification email.
    const msg = {
      to: email,
      from: process.env.EMAIL_FROM, // This must be a verified sender in SendGrid.
      subject: "Verify Your Waitlist Signup",
      text: `Click the link to verify your email: ${verificationLink}`,
      html: `<p>Click <a href="${verificationLink}">here</a> to verify your email and complete your waitlist registration.</p>`,
    };

    await sendgrid.send(msg);
    return res
      .status(200)
      .json({ message: "Verification email sent. Please check your inbox." });
  } catch (error) {
    console.error("Error in waitlist API:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
