require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to NeonDB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Test the database connection
pool.connect()
  .then(() => console.log("Connected to NeonDB ✅"))
  .catch((err) => console.error("Database connection error:", err));

// Import and mount authentication routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// Basic test route
app.get("/", (req, res) => {
  res.send("EasyGP Backend is Running! 🚀");
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🔥`));
