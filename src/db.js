// db.js - Complete Dexie database setup with cognitive and cholesterol tracking
import Dexie from "dexie";

// Create the database instance
export const db = new Dexie("StrepDatabase");

// Define schema for all tables
const schema = {
  logs: "++id, startDate, observationDate, outcome",
  profile: "++id",
  bpLogs: "++id, date, systolic, diastolic, pulse, notes, medications, dateTime, timestamp",
  cognitiveLogs: "++id, date, emojis, thought, action, feeling, supporting, contrary", // ✅ Added
  medications: "++id, name, dosage, frequency, timeToTake, startDate, endDate, sideEffects, notes",
  cholesterolLogs: "++id, date, totalCholesterol, hdl, ratio, notes"
};

// Initialize with updated schema version
db.version(2).stores(schema);

// Optional verification & repair utility
async function verifyDatabase() {
  try {
    await db.open();
    const missingTables = Object.keys(schema).filter(
      (name) => !db.tables.some((t) => t.name === name)
    );

    if (missingTables.length > 0) {
      console.warn("Missing tables:", missingTables);
      db.close();
      await Dexie.delete("StrepDatabase");
      const newDb = new Dexie("StrepDatabase");
      newDb.version(2).stores(schema);
      await newDb.open();
      Object.assign(db, newDb);
      console.log("Database structure recreated.");
      return true;
    }

    console.log("All required tables present.");
    return false;
  } catch (error) {
    console.error("Database error:", error);
    try {
      if (db.isOpen()) db.close();
      await Dexie.delete("StrepDatabase");
      const newDb = new Dexie("StrepDatabase");
      newDb.version(2).stores(schema);
      await newDb.open();
      Object.assign(db, newDb);
      console.log("Database recovered successfully.");
      return true;
    } catch (recoveryError) {
      console.error("Failed to recover database:", recoveryError);
      throw recoveryError;
    }
  }
}

// Run verification on load
verifyDatabase().then((wasRecreated) => {
  if (wasRecreated && typeof window !== "undefined") {
    console.log("Reloading to apply new DB structure...");
    // window.location.reload(); // Uncomment to auto-refresh
  }
});

export default db;
