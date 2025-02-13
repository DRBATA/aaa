// db.js
import Dexie from "dexie";

// Create a new Dexie database named "StrepDatabase"
export const db = new Dexie("StrepDatabase");

// Define the schema for version 1 of your database.
// Each log entry stores the user-entered startDate (when symptoms began),
// the observationDate (when this log was recorded),
// the final outcome, and all other symptom data.
db.version(1).stores({
  logs: "++id, startDate, observationDate, outcome"
});
