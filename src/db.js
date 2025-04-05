// db.js - Complete rewrite with robust initialization
import Dexie from "dexie"

// Create a new Dexie database named "StrepDatabase"
export const db = new Dexie("StrepDatabase")

// Define all tables in one place for clarity
const schema = {
  logs: "++id, startDate, observationDate, outcome",
  profile: "++id",
  bpLogs: "++id, date, systolic, diastolic, pulse, notes, medications, dateTime, timestamp",
  cognitiveEntries:
    "++id, timestamp, emotion, intensity, thoughtPattern, processingStage, situation, automaticThoughts, evidence, alternativeThoughts, actionPlan",
  medications: "++id, name, dosage, frequency, timeToTake, startDate, endDate, sideEffects, notes"
}

// Initialize database with all tables
db.version(1).stores(schema)

// Function to verify and repair database if needed
async function verifyDatabase() {
  try {
    console.log("Verifying database structure...")

    // First, try to open the database
    await db.open()
    console.log("Database opened successfully with version", db.verno)

    // Check if all required tables exist
    const missingTables = []
    for (const tableName of Object.keys(schema)) {
      if (!db.tables.some((t) => t.name === tableName)) {
        missingTables.push(tableName)
      }
    }

    // If tables are missing, we need to recreate the database
    if (missingTables.length > 0) {
      console.warn("Missing tables detected:", missingTables)
      console.log("Attempting to recreate database structure...")

      // Close the database
      db.close()

      // Delete the database to start fresh
      await Dexie.delete("StrepDatabase")

      // Create a new database with all tables
      const newDb = new Dexie("StrepDatabase")
      newDb.version(1).stores(schema)

      // Open the new database
      await newDb.open()

      // Replace the global db object
      Object.assign(db, newDb)

      console.log("Database recreated successfully with all tables")

      // Return true to indicate the database was recreated
      return true
    }

    console.log("All required tables exist")
    return false
  } catch (error) {
    console.error("Error verifying database:", error)

    // If there's a version error or other critical error, try to recreate the database
    try {
      console.log("Attempting to recover from database error...")

      // Close the database if it's open
      if (db.isOpen()) {
        db.close()
      }

      // Delete the database
      await Dexie.delete("StrepDatabase")

      // Create a new database with all tables
      const newDb = new Dexie("StrepDatabase")
      newDb.version(1).stores(schema)

      // Open the new database
      await newDb.open()

      // Replace the global db object
      Object.assign(db, newDb)

      console.log("Database recovered successfully")
      return true
    } catch (recoveryError) {
      console.error("Failed to recover database:", recoveryError)
      throw recoveryError
    }
  }
}

// Initialize the database when the module is imported
verifyDatabase().then((wasRecreated) => {
  if (wasRecreated) {
    // If the database was recreated, we might want to reload the page
    // to ensure all components use the new database structure
    if (typeof window !== "undefined") {
      console.log("Reloading page to use new database structure")
      // Uncomment the line below if you want automatic reload
      // window.location.reload();
    }
  }
})

export default db

