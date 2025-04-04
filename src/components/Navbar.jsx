import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Download, Home, ClipboardList, PenToolIcon as Tool, Book, Smartphone, Grid2x2, Apple, Upload, Database, Brain } from 'lucide-react';
import phiLogo from "/src/assets/phi-logo.png";
import { db } from "../db"; // Import your existing Dexie db

export default function Navbar() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installText, setInstallText] = useState("Install");
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDataMenu, setShowDataMenu] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallText("Install");
    };

    const handleControllerChange = () => {
      setInstallText("Update");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    navigator.serviceWorker?.addEventListener("controllerchange", handleControllerChange);

    // Close data menu when clicking outside
    const handleClickOutside = (e) => {
      if (showDataMenu && !e.target.closest(".data-management")) {
        setShowDataMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      navigator.serviceWorker?.removeEventListener("controllerchange", handleControllerChange);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showDataMenu]);

  const handleInstallClick = () => {
    if (installText === "Update") {
      window.location.reload();
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User installed the app");
        }
        setDeferredPrompt(null);
      });
    }
  };

  const handleIOSInstallClick = () => {
    alert(
      "To install this app on your iOS device:\n\n1. Open Safari.\n2. Tap the Share icon.\n3. Select 'Add to Home Screen'.",
    );
  };

  // Export data function
  const handleExportData = async () => {
    try {
      setIsExporting(true);
      setShowDataMenu(false);

      // Get all data from all tables
      const logs = await db.logs.toArray();
      const profile = await db.table("profile").toArray();
      const bpLogs = (await db.table("bpLogs")?.toArray()) || [];
      const cognitiveEntries = (await db.table("cognitiveEntries")?.toArray()) || [];

      if (logs.length === 0 && profile.length === 0 && bpLogs.length === 0 && cognitiveEntries.length === 0) {
        alert("No data to export.");
        setIsExporting(false);
        return;
      }

      // Prepare export data
      const exportData = {
        logs,
        profile,
        bpLogs,
        cognitiveEntries,
        exportDate: new Date().toISOString(),
        appVersion: "1.0.0", // You can update this with your app version
      };

      const defaultFileName = `EasyGP-Export-${new Date().toISOString().slice(0, 10)}.json`;
      const fileName = prompt("Enter file name for export:", defaultFileName);
      if (!fileName) {
        setIsExporting(false);
        return;
      }

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName.endsWith(".json") ? fileName : fileName + ".json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert("Data exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      alert("Error exporting data: " + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Import data function - MERGE with existing data
  const handleImportData = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      setIsImporting(true);
      setShowDataMenu(false);

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          let addedCount = 0;

          // Process logs
          if (importedData.logs && importedData.logs.length > 0) {
            await db.transaction("rw", db.logs, async () => {
              for (const entry of importedData.logs) {
                // Check if an entry with the same observationDate exists
                const existingEntry = await db.logs.where("observationDate").equals(entry.observationDate).first();

                if (!existingEntry) {
                  // Add only if it doesn't exist
                  await db.logs.add(entry);
                  addedCount++;
                }
              }
            });
          }

          // Process profile - only add if no profile exists
          if (importedData.profile && importedData.profile.length > 0) {
            const existingProfile = await db.table("profile").toArray();
            if (existingProfile.length === 0) {
              await db.table("profile").add(importedData.profile[0]);
              addedCount++;
            }
          }

          // Process BP logs
          if (importedData.bpLogs && importedData.bpLogs.length > 0) {
            // Ensure bpLogs table exists
            if (!db.tables.some((t) => t.name === "bpLogs")) {
              db.version(db.verno + 1).stores({
                bpLogs: "++id, date, systolic, diastolic, pulse, mood",
              });
              await db.open();
            }

            await db.transaction("rw", db.table("bpLogs"), async () => {
              for (const entry of importedData.bpLogs) {
                // Check if an entry with the same date exists
                const existingEntry = await db.table("bpLogs").where("date").equals(entry.date).first();

                if (!existingEntry) {
                  // Add only if it doesn't exist
                  await db.table("bpLogs").add(entry);
                  addedCount++;
                }
              }
            });
          }

          // Process cognitive entries
          if (importedData.cognitiveEntries && importedData.cognitiveEntries.length > 0) {
            // Ensure cognitiveEntries table exists
            if (!db.tables.some((t) => t.name === "cognitiveEntries")) {
              db.version(db.verno + 1).stores({
                cognitiveEntries: "++id, timestamp, emotion, intensity, thoughtPattern, processingStage",
              });
              await db.open();
            }

            await db.transaction("rw", db.table("cognitiveEntries"), async () => {
              for (const entry of importedData.cognitiveEntries) {
                // Check if an entry with the same timestamp exists
                const existingEntry = await db.table("cognitiveEntries").where("timestamp").equals(entry.timestamp).first();

                if (!existingEntry) {
                  // Add only if it doesn't exist
                  await db.table("cognitiveEntries").add(entry);
                  addedCount++;
                }
              }
            });
          }

          alert(`Import successful! Added ${addedCount} new entries.`);
        } catch (parseError) {
          console.error("Parse error:", parseError);
          alert("Error parsing import file: " + parseError.message);
        } finally {
          setIsImporting(false);
          // Reset the file input
          event.target.value = null;
        }
      };

      reader.readAsText(file);
    } catch (error) {
      console.error("Import error:", error);
      alert("Error importing data: " + error.message);
      setIsImporting(false);
      // Reset the file input
      if (event.target) event.target.value = null;
    }
  };

  return (
    <nav className="navbar">
      {/* Logo Section */}
      <div className="logo-section">
        <img src={phiLogo || "/placeholder.svg"} alt="EasyGP Logo" className="nav-logo" />
      </div>

      {/* Updated Main Navigation Links */}
      <div className="nav-links">
        <Link to="/" className="nav-link">
          <Home className="icon" size={18} aria-hidden="true" />
          <span>Home</span>
        </Link>
        <Link to="/otc-guide" className="nav-link">
          <Book className="icon" size={18} aria-hidden="true" />
          <span>OTC Guide</span>
        </Link>
        <Link to="/strep-tool" className="nav-link">
          <ClipboardList className="icon" size={18} aria-hidden="true" />
          <span>Infection Calculator</span>
        </Link>
        <Link to="/book-now" className="nav-link">
          <Tool className="icon" size={18} aria-hidden="true" />
          <span>Health Profile</span>
        </Link>
        <Link to="/bp-tracker" className="nav-link">
          <Database className="icon" size={18} aria-hidden="true" />
          <span>BP & Mood</span>
        </Link>
        <Link to="/cognitive-journal" className="nav-link">
          <Brain className="icon" size={18} aria-hidden="true" />
          <span>Cognitive Journal</span>
        </Link>

        {/* Data Management Dropdown */}
        <div className="data-management">
          <button
            className="nav-link"
            onClick={(e) => {
              e.stopPropagation();
              setShowDataMenu(!showDataMenu);
            }}
          >
            <Upload className="icon" size={18} aria-hidden="true" />
            <span>Data</span>
          </button>

          {showDataMenu && (
            <div className="data-menu">
              <button onClick={handleExportData} disabled={isExporting} className="data-menu-item">
                <Download size={16} className="icon" />
                <span>{isExporting ? "Exporting..." : "Export Data"}</span>
              </button>

              <label className="data-menu-item">
                <Upload size={16} className="icon" />
                <span>{isImporting ? "Importing..." : "Import Data"}</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  disabled={isImporting}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Updated Actions Section */}
      <div className="nav-buttons">
        <button className="nav-btn" onClick={handleInstallClick} aria-label="Install or Update EasyGP">
          <Download className="icon" size={18} aria-hidden="true" />
          <span>{installText}</span>
          <span className="platform-icons" style={{ marginLeft: "0.5rem" }}>
            <Smartphone size={16} aria-hidden="true" style={{ marginRight: "0.25rem" }} />
            <Grid2x2 size={16} aria-hidden="true" />
          </span>
        </button>

        <button className="nav-btn" onClick={handleIOSInstallClick} aria-label="iOS Install Instructions">
          <Apple className="icon" size={18} aria-hidden="true" />
          <span>iOS Install</span>
        </button>
      </div>
    </nav>
  );
}