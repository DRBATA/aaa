// src/pages/BPTracker.jsx
import { useState, useEffect, useRef } from "react";
import { db } from "../db";
import { Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

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
  });

  // BP logs state
  const [bpLogs, setBpLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [medications, setMedications] = useState([]);
  const [viewType, setViewType] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedReading, setSelectedReading] = useState(null);
  const containerRef = useRef(null);

  // Load BP logs and medications on component mount
  useEffect(() => {
    async function loadData() {
      try {
        // Create bpLogs table if it doesn't exist
        if (!db.tables.some((t) => t.name === "bpLogs")) {
          db.version(db.verno + 1).stores({
            bpLogs: "++id, date, systolic, diastolic, pulse",
          });
          await db.open();
        }

        // Load BP logs
        const logs = await db.table("bpLogs").toArray();
        setBpLogs(logs.sort((a, b) => new Date(b.date) - new Date(a.date)));

        // Load medications from profile
        const profile = await db.table("profile").toArray();
        if (profile && profile.length > 0 && profile[0].medications) {
          setMedications(profile[0].medications.filter((med) => med.trim() !== ""));
        }
      } catch (error) {
        console.error("Error loading BP logs:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle medication checkbox changes
  const handleMedicationChange = (medication) => {
    setFormData((prev) => {
      const newMedications = [...prev.medications];
      if (newMedications.includes(medication)) {
        return { ...prev, medications: newMedications.filter((med) => med !== medication) };
      } else {
        return { ...prev, medications: [...newMedications, medication] };
      }
    });
  };

  // Save BP log
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const logData = {
        ...formData,
        dateTime: `${formData.date}T${formData.time}`,
        timestamp: new Date().toISOString(),
      };

      if (editingId) {
        // Update existing log
        await db.table("bpLogs").update(editingId, logData);
        setBpLogs((prev) =>
          prev
            .map((log) => (log.id === editingId ? { ...logData, id: editingId } : log))
            .sort((a, b) => new Date(b.date) - new Date(a.date)),
        );
        setEditingId(null);
      } else {
        // Add new log
        const id = await db.table("bpLogs").add(logData);
        setBpLogs((prev) => [{ ...logData, id }, ...prev]);
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
      });
    } catch (error) {
      console.error("Error saving BP log:", error);
      alert("Error saving BP log: " + error.message);
    }
  };

  // Delete BP log
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await db.table("bpLogs").delete(id);
        setBpLogs((prev) => prev.filter((log) => log.id !== id));
      } catch (error) {
        console.error("Error deleting BP log:", error);
        alert("Error deleting BP log: " + error.message);
      }
    }
  };

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
    });
    setEditingId(log.id);

    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: "short", year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get BP status
  const getBPStatus = (systolic, diastolic) => {
    if (systolic <= 120 && diastolic <= 80) {
      return { status: "normal", color: "rgba(52, 211, 153, 0.8)" };
    } else if ((systolic > 120 && systolic <= 130) || (diastolic > 80 && diastolic <= 85)) {
      return { status: "elevated", color: "rgba(251, 191, 36, 0.8)" };
    } else {
      return { status: "high", color: "rgba(239, 68, 68, 0.8)" };
    }
  };

  // Get date range for chart
  const getDateRange = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (viewType === "month") {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0);
    } else {
      start.setDate(start.getDate() - 7);
    }

    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  // Handle time shift
  const handleTimeShift = (direction) => {
    const newDate = new Date(currentDate);
    if (viewType === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === "forward" ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === "forward" ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  // Get visible data for chart
  const getVisibleData = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    if (viewType === "month") {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0);
    } else {
      start.setDate(start.getDate() - 7);
    }

    return bpLogs
      .filter((log) => {
        const logDate = new Date(log.date);
        return logDate >= start && logDate <= end;
      })
      .map((log) => ({
        date: new Date(log.date).toLocaleDateString(),
        systolic: Number.parseInt(log.systolic),
        diastolic: Number.parseInt(log.diastolic),
        pulse: Number.parseInt(log.pulse),
        id: log.id,
      }));
  };

  // Prepare chart data
  const chartData = getVisibleData();

  return (
    <div className="content">
      <div className="bp-tracker-container">
        <h1>BP Tracker</h1>

        {/* Chart View */}
        <div className="welcome-section">
          <div className="flex items-center justify-between mb-4">
            <button className="glassmorphic-btn p-2" onClick={() => handleTimeShift("backward")}>
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-4">
              <span className="bg-white/20 px-4 py-2 rounded-full">{getDateRange()}</span>

              <select value={viewType} onChange={(e) => setViewType(e.target.value)} className="glassmorphic-select">
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </div>

            <button className="glassmorphic-btn p-2" onClick={() => handleTimeShift("forward")}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div ref={containerRef} className="relative h-[400px] bg-white/5 rounded-lg overflow-hidden p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.5)" />
                <YAxis stroke="rgba(255, 255, 255, 0.5)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    border: "none",
                    borderRadius: "8px",
                    backdropFilter: "blur(10px)",
                  }}
                  labelStyle={{ color: "white" }}
                  itemStyle={{ color: "white" }}
                />
                <ReferenceLine y={120} stroke="rgba(52, 211, 153, 0.3)" strokeDasharray="3 3" />
                <ReferenceLine y={130} stroke="rgba(251, 191, 36, 0.3)" strokeDasharray="3 3" />
                <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="pulse" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>

            {/* Medication Timeline */}
            <div className="absolute bottom-0 left-0 right-0 h-6 flex">
              {medications.map((med, index) => (
                <div
                  key={med}
                  className="h-4 mx-1"
                  style={{
                    backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
                    width: "10px",
                    borderRadius: "2px",
                  }}
                >
                  <span className="absolute left-0 bottom-6 text-xs whitespace-nowrap overflow-hidden opacity-70">
                    {med}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

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
                  setEditingId(null);
                  setFormData({
                    date: new Date().toISOString().split("T")[0],
                    time: new Date().toTimeString().slice(0, 5),
                    systolic: "",
                    diastolic: "",
                    pulse: "",
                    notes: "",
                    medications: [],
                  });
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
              const bpStatus = getBPStatus(log.systolic, log.diastolic);
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
              );
            })
          )}
        </div>

        {/* Selected Reading Details */}
        {selectedReading && (
          <div className="welcome-section">
            <div className="flex justify-between items-center">
              <h2>Reading Details</h2>
              <button className="glassmorphic-btn p-2" onClick={() => setSelectedReading(null)}>
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <h3>Date & Time</h3>
                <p>
                  {formatDate(selectedReading.date)} {selectedReading.time}
                </p>

                <h3 className="mt-4">Blood Pressure</h3>
                <div className="text-2xl">
                  <span style={{ color: getBPStatus(selectedReading.systolic, selectedReading.diastolic).color }}>
                    {selectedReading.systolic}/{selectedReading.diastolic} mmHg
                  </span>
                </div>

                <h3 className="mt-4">Pulse</h3>
                <p>{selectedReading.pulse} bpm</p>

                <h3 className="mt-4">Status</h3>
                <p>{getBPStatus(selectedReading.systolic, selectedReading.diastolic).status}</p>
              </div>

              <div>
                <h3 className="mt-4">Notes</h3>
                <p>{selectedReading.notes || "No notes"}</p>

                <h3 className="mt-4">Medications Taken</h3>
                {selectedReading.medications && selectedReading.medications.length > 0 ? (
                  <ul>
                    {selectedReading.medications.map((med) => (
                      <li key={med}>{med}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No medications recorded</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}