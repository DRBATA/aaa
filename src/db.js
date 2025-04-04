// db.js
import Dexie from "dexie";

// Create a new Dexie database named "StrepDatabase" (keeping your original name)
export const db = new Dexie("StrepDatabase");

// Define the schema for version 1 of your database.
// Keeping your original schema exactly as it is
db.version(1).stores({
  logs: "++id, startDate, observationDate, outcome"
});

// Function to check and add new tables if needed
async function ensureTablesExist() {
  try {
    await db.open();
    let currentVersion = db.verno;
    let needsUpdate = false;
    
    // Check if profile table exists
    if (!db.tables.some(t => t.name === "profile")) {
      currentVersion++;
      db.version(currentVersion).stores({
        profile: "++id"
      });
      needsUpdate = true;
    }
    
    // Check if bpLogs table exists
    if (!db.tables.some(t => t.name === "bpLogs")) {
      currentVersion++;
      db.version(currentVersion).stores({
        bpLogs: "++id, date, systolic, diastolic, pulse, mood"
      });
      needsUpdate = true;
    }
    
    // Check if cognitiveEntries table exists
    if (!db.tables.some(t => t.name === "cognitiveEntries")) {
      currentVersion++;
      db.version(currentVersion).stores({
        cognitiveEntries: "++id, timestamp, emotion, intensity, thoughtPattern, processingStage"
      });
      needsUpdate = true;
    }
    
    // If we need to update, reopen the database
    if (needsUpdate) {
      console.log("Updating database schema to version", currentVersion);
      await db.open();
    }
    
    console.log("Database ready with version", db.verno);
  } catch (error) {
    console.error("Error ensuring tables exist:", error);
  }
}

// Run the check when the app starts
ensureTablesExist();

export default db;