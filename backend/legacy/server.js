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

pool.connect()
  .then(() => console.log("Connected to NeonDB ✅"))
  .catch((err) => console.error("Database connection error:", err));

// Mount routes
const authRoutes = require("./routes/auth");
const testsRoutes = require("./routes/tests");

app.use("/api/auth", authRoutes);
app.use("/api/tests", testsRoutes);

// Basic test route
app.get("/", (req, res) => {
  res.send("EasyGP Backend is Running! 🚀");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT} 🔥`));
