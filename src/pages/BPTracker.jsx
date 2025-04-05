"use client"

import { useState, useEffect } from "react"
import { db } from "../db"
import { Edit, Trash2 } from "lucide-react"

export default function BPTracker() {
  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    time: new Date().toTimeString().slice(0, 5),
    systolic: "",
    diastolic: "",
    pulse: "",
    notes: "",
    medications: [],
  })

  // BP logs state
  const [bpLogs, setBpLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [medications, setMedications] = useState([])
  const [selectedReading, setSelectedReading] = useState(null)

  // Ensure the bpLogs table exists
  useEffect(() => {
    async function setupDatabase() {
      try {
        // Check if bpLogs table exists
        if (!db.tables.some((t) => t.name === "bpLogs")) {
          console.log("Creating bpLogs table")
          // Create the table
          db.version(db.verno + 1).stores({
            bpLogs: "++id, date, systolic, diastolic, pulse, notes, medications, dateTime, timestamp",
          })

          // Open the database with the new schema
          await db.open()
          console.log("bpLogs table created successfully")
        }

        // Now load data
        loadData()
      } catch (error) {
        console.error("Error setting up database:", error)
        setIsLoading(false)
      }
    }

    async function loadData() {
      try {
        // Load BP logs
        const logs = await db.table("bpLogs").toArray()
        setBpLogs(logs.sort((a, b) => new Date(b.date) - new Date(a.date)))

        // Load medications from profile
        try {
          const profile = await db.table("profile").toArray()
          if (profile && profile.length > 0 && profile[0].medications) {
            setMedications(profile[0].medications.filter((med) => med.trim() !== ""))
          }

          // Also check medications table if it exists
          if (db.tables.some((t) => t.name === "medications")) {
            const meds = await db.table("medications").toArray()
            if (meds && meds.length > 0) {
              const medNames = meds.map((m) => m.name)
              setMedications((prev) => [...new Set([...prev, ...medNames])])
            }
          }
        } catch (profileError) {
          console.error("Error loading profile:", profileError)
        }
      } catch (error) {
        console.error("Error loading BP logs:", error)
      } finally {
        setIsLoading(false)
      }
    }

    setupDatabase()
  }, [])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Handle medication checkbox changes
  const handleMedicationChange = (medication) => {
    setFormData((prev) => {
      const newMedications = [...prev.medications]
      if (newMedications.includes(medication)) {
        return { ...prev, medications: newMedications.filter((med) => med !== medication) }
      } else {
        return { ...prev, medications: [...newMedications, medication] }
      }
    })
  }

  // Save BP log
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const logData = {
        ...formData,
        dateTime: `${formData.date}T${formData.time}`,
        timestamp: new Date().toISOString(),
      }

      if (editingId) {
        // Update existing log
        await db.table("bpLogs").update(editingId, logData)
        setBpLogs((prev) =>
          prev
            .map((log) => (log.id === editingId ? { ...logData, id: editingId } : log))
            .sort((a, b) => new Date(b.date) - new Date(a.date)),
        )
        setEditingId(null)
      } else {
        // Add new log
        const id = await db.table("bpLogs").add(logData)
        setBpLogs((prev) => [{ ...logData, id }, ...prev])
      }

      // Reset form
      setFormData({
        date: new Date().toISOString().split("T")[0],
        time: new Date().toTimeString().slice(0, 5),
        systolic: "",
        diastolic: "",
        pulse: "",
        notes: "",
        medications: [],
      })
    } catch (error) {
      console.error("Error saving BP log:", error)
      alert("Error saving BP log: " + error.message)
    }
  }

  // Delete BP log
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await db.table("bpLogs").delete(id)
        setBpLogs((prev) => prev.filter((log) => log.id !== id))
      } catch (error) {
        console.error("Error deleting BP log:", error)
        alert("Error deleting BP log: " + error.message)
      }
    }
  }

  // Edit BP log
  const handleEdit = (log) => {
    setFormData({
      date: log.date,
      time: log.time || "12:00",
      systolic: log.systolic,
      diastolic: log.diastolic,
      pulse: log.pulse,
      notes: log.notes || "",
      medications: log.medications || [],
    })
    setEditingId(log.id)

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: "short", year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Get BP status
  const getBPStatus = (systolic, diastolic) => {
    if (systolic <= 120 && diastolic <= 80) {
      return { status: "normal", color: "rgba(52, 211, 153, 0.8)" }
    } else if ((systolic > 120 && systolic <= 130) || (diastolic > 80 && diastolic <= 85)) {
      return { status: "elevated", color: "rgba(251, 191, 36, 0.8)" }
    } else {
      return { status: "high", color: "rgba(239, 68, 68, 0.8)" }
    }
  }

  return (
    <div className="content">
      <div className="bp-tracker-container">
        <h1>BP Tracker</h1>

        {/* BP Entry Form */}
        <form onSubmit={handleSubmit} className="welcome-section">
          <h2>{editingId ? "Edit Entry" : "Add New Entry"}</h2>

          <div className="form-group">
            <label>Date & Time</label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="glassmorphic-select"
              />
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                required
                className="glassmorphic-select"
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Systolic (mmHg)</label>
              <input
                type="number"
                name="systolic"
                value={formData.systolic}
                onChange={handleChange}
                placeholder="120"
                required
                className="glassmorphic-select"
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label>Diastolic (mmHg)</label>
              <input
                type="number"
                name="diastolic"
                value={formData.diastolic}
                onChange={handleChange}
                placeholder="80"
                required
                className="glassmorphic-select"
              />
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label>Pulse (bpm)</label>
              <input
                type="number"
                name="pulse"
                value={formData.pulse}
                onChange={handleChange}
                placeholder="70"
                className="glassmorphic-select"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional notes..."
              className="glassmorphic-select"
            />
          </div>

          {/* Medication Checklist */}
          {medications.length > 0 && (
            <div className="medication-block">
              <h3>Medications Taken</h3>
              <div className="medication-list">
                {medications.map((medication) => (
                  <label key={medication} className="medication-item">
                    <input
                      type="checkbox"
                      checked={formData.medications.includes(medication)}
                      onChange={() => handleMedicationChange(medication)}
                    />
                    {medication}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="form-actions">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setFormData({
                    date: new Date().toISOString().split("T")[0],
                    time: new Date().toTimeString().slice(0, 5),
                    systolic: "",
                    diastolic: "",
                    pulse: "",
                    notes: "",
                    medications: [],
                  })
                }}
                className="secondary-button"
              >
                Cancel
              </button>
            )}
            <button type="submit" className="glassmorphic-btn">
              {editingId ? "Update Entry" : "Save Entry"}
            </button>
          </div>
        </form>

        {/* BP History */}
        <div className="welcome-section">
          <h2>History</h2>

          {isLoading ? (
            <p>Loading...</p>
          ) : bpLogs.length === 0 ? (
            <p>No entries yet. Add your first BP reading above.</p>
          ) : (
            bpLogs.map((log) => {
              const bpStatus = getBPStatus(log.systolic, log.diastolic)
              return (
                <div key={log.id} className="bp-entry">
                  <div className="bp-entry-date">
                    {formatDate(log.date)}
                    {log.time && <span style={{ fontSize: "0.8rem", marginLeft: "5px" }}>{log.time}</span>}
                  </div>

                  <div className="bp-entry-values">
                    <div className="bp-entry-value">
                      <span>Systolic</span>
                      <strong style={{ color: bpStatus.color }}>{log.systolic}</strong>
                    </div>
                    <div className="bp-entry-value">
                      <span>Diastolic</span>
                      <strong style={{ color: bpStatus.color }}>{log.diastolic}</strong>
                    </div>
                    {log.pulse && (
                      <div className="bp-entry-value">
                        <span>Pulse</span>
                        <strong>{log.pulse}</strong>
                      </div>
                    )}
                  </div>

                  <div className="bp-entry-actions">
                    <button className="bp-entry-action" onClick={() => handleEdit(log)} aria-label="Edit entry">
                      <Edit size={16} />
                    </button>
                    <button
                      className="bp-entry-action delete"
                      onClick={() => handleDelete(log.id)}
                      aria-label="Delete entry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

