import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"

// Initialize the database (optional, but recommended)
// This ensures the database is open before rendering
import { db } from "./db"

// Ensure the database is open before rendering
db.open()
  .then(() => {
    console.log("Database opened successfully in main.jsx")

    // Initialize the React app
    createRoot(document.getElementById("root")).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
  .catch((error) => {
    console.error("Error opening database in main.jsx:", error)

    // Render the app anyway, as the db.js file has recovery mechanisms
    createRoot(document.getElementById("root")).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })

