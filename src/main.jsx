import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Initialize the database (optional, but recommended)
import { db } from "./db"

// Ensure the database is open before rendering
db.open().catch(err => {
  console.error("Failed to open database:", err)
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)