// pages/StrepTool.jsx
import React, { useState, useEffect } from "react";
import { db } from "../db";
import { format } from "date-fns";

export default function StrepTool() {
  const [logs, setLogs] = useState([]);

  // Fetch log entries on component mount
  useEffect(() => {
    fetchLogs();
  }, []);

  // Retrieve all logs (most recent first)
  const fetchLogs = async () => {
    const allLogs = await db.symptomLogs.orderBy("date").reverse().toArray();
    setLogs(allLogs);
  };

  // Export all log data as a JSON file and clear the Dexie table
  const handleExportClick = async () => {
    const allData = await db.symptomLogs.toArray();
    if (allData.length === 0) {
      alert("No data to export.");
      return;
    }
    const defaultFileName = `EasyGP-export-${new Date().toISOString().slice(0, 10)}.json`;
    const fileName = prompt("Enter file name for export:", defaultFileName);
    if (!fileName) return;
    const jsonString = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName.endsWith(".json") ? fileName : fileName + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    await db.symptomLogs.clear();
    alert("Data exported and local symptom log cleared.");
    fetchLogs();
  };

  // Import functionality (placeholder for now)
  const handleImportClick = () => {
    alert("Import functionality not implemented yet.");
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Strep Tool</h1>
        <p className="subtitle">
          Log your symptoms and manage your data. Use the buttons below to import or export your symptom data.
        </p>
      </div>

      <div className="features-grid">
        {/* Data Management Section */}
        <div className="feature-card">
          <h2>Data Management</h2>
          <p>
            Use the buttons below to import new data or export your current symptom logs.
          </p>
          <div style={{ marginTop: "1rem" }}>
            <button className="nav-btn" onClick={handleImportClick} style={{ marginRight: "1rem" }}>
              Import Data
            </button>
            <button className="nav-btn" onClick={handleExportClick}>
              Export Data
            </button>
          </div>
        </div>

        {/* Logged Entries Section */}
        <div className="feature-card">
          <h2>Logged Entries</h2>
          <ul>
            {logs.map((log) => (
              <li key={log.id}>
                <strong>{format(new Date(log.date), "PPpp")}</strong>: Viral: {log.viral}, Strep: {log.strep}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
