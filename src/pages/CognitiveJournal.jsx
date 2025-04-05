"use client"

import { useState, useEffect, useRef } from "react"
import { db } from "../db"
import { ChevronLeft, ChevronRight, Plus, Check, Edit, Trash2 } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from "recharts"

export default function CognitiveJournal() {
  // State for journal entries
  const [entries, setEntries] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState("week")
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef(null)

  // New entry form state
  const [newEntry, setNewEntry] = useState({
    emotion: "😊",
    intensity: 50,
    thoughtPattern: "catastrophizing",
    situation: "",
    automaticThoughts: "",
    evidence: "",
    alternativeThoughts: "",
    actionPlan: "",
    processingStage: "initial",
  })

  // Ensure the cognitiveEntries table exists
  useEffect(() => {
    async function setupDatabase() {
      try {
        // Check if cognitiveEntries table exists
        if (!db.tables.some((t) => t.name === "cognitiveEntries")) {
          console.log("Creating cognitiveEntries table")
          // Create the table
          db.version(db.verno + 1).stores({
            cognitiveEntries:
              "++id, timestamp, emotion, intensity, thoughtPattern, processingStage, situation, automaticThoughts, evidence, alternativeThoughts, actionPlan",
          })

          // Open the database with the new schema
          await db.open()
          console.log("cognitiveEntries table created successfully")
        }

        // Now load entries
        loadEntries()
      } catch (error) {
        console.error("Error setting up database:", error)
        setIsLoading(false)
      }
    }

    async function loadEntries() {
      try {
        // Load entries
        const loadedEntries = await db.table("cognitiveEntries").toArray()
        setEntries(loadedEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)))
      } catch (error) {
        console.error("Error loading cognitive entries:", error)
      } finally {
        setIsLoading(false)
      }
    }

    setupDatabase()
  }, [])

  // Thought patterns
  const THOUGHT_PATTERNS = {
    catastrophizing: { label: "Stormy Thoughts", color: "#4A5568" },
    blackAndWhite: { label: "All-or-Nothing", color: "#F6E05E" },
    overgeneralization: { label: "Clouded Judgment", color: "#718096" },
    mindReading: { label: "Lightning Conclusions", color: "#9F7AEA" },
    emotionalReasoning: { label: "Emotional Downpour", color: "#FC8181" },
    shouldStatements: { label: "Pressure Front", color: "#4FD1C5" },
    personalization: { label: "Self-Centered Forecast", color: "#F6AD55" },
    filteringPositives: { label: "Overcast Positivity", color: "#9F7AEA" },
  }

  // Emotions
  const EMOTIONS = [
    "😊",
    "😢",
    "😠",
    "😍",
    "🤔",
    "😎",
    "🙃",
    "😴",
    "🥳",
    "😱",
    "😡",
    "😌",
    "🥺",
    "😤",
    "😇",
    "🤯",
    "😰",
    "🤗",
    "😑",
    "🙄",
  ]

  // Get date range for chart
  const getDateRange = () => {
    const start = new Date(selectedDate)
    const end = new Date(selectedDate)

    if (viewMode === "month") {
      start.setDate(1)
      end.setMonth(end.getMonth() + 1, 0)
    } else {
      start.setDate(start.getDate() - 7)
    }

    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
  }

  // Handle time shift
  const handleTimeShift = (direction) => {
    const newDate = new Date(selectedDate)
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === "forward" ? 1 : -1))
    } else {
      newDate.setDate(newDate.getDate() + (direction === "forward" ? 7 : -7))
    }
    setSelectedDate(newDate)
  }

  // Get visible data for chart
  const getVisibleData = () => {
    const start = new Date(selectedDate)
    const end = new Date(selectedDate)

    if (viewMode === "month") {
      start.setDate(1)
      end.setMonth(end.getMonth() + 1, 0)
    } else {
      start.setDate(start.getDate() - 7)
    }

    return entries
      .filter((entry) => {
        const entryDate = new Date(entry.timestamp)
        return entryDate >= start && entryDate <= end
      })
      .map((entry) => ({
        time: new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        date: new Date(entry.timestamp).toLocaleDateString(),
        intensity: entry.intensity,
        emotion: entry.emotion,
        id: entry.id,
        processingStage: entry.processingStage,
      }))
  }

  // Add new entry
  const handleAddEntry = async () => {
    if (!newEntry.situation.trim() || !newEntry.automaticThoughts.trim() || !newEntry.emotion) {
      alert("Please fill in at least the situation, thoughts, and emotion.")
      return
    }

    try {
      const entryData = {
        ...newEntry,
        timestamp: new Date().toISOString(),
      }

      // Add to database
      const id = await db.table("cognitiveEntries").add(entryData)

      // Update state
      setEntries([{ ...entryData, id }, ...entries])

      // Reset form
      setNewEntry({
        emotion: "😊",
        intensity: 50,
        thoughtPattern: "catastrophizing",
        situation: "",
        automaticThoughts: "",
        evidence: "",
        alternativeThoughts: "",
        actionPlan: "",
        processingStage: "initial",
      })

      setIsAddingEntry(false)
    } catch (error) {
      console.error("Error saving cognitive entry:", error)
      alert("Error saving entry: " + error.message)
    }
  }

  // Update entry processing stage
  const updateEntryStage = async (entryId, newStage) => {
    try {
      await db.table("cognitiveEntries").update(entryId, { processingStage: newStage })
      setEntries(entries.map((entry) => (entry.id === entryId ? { ...entry, processingStage: newStage } : entry)))

      if (selectedEntry && selectedEntry.id === entryId) {
        setSelectedEntry({ ...selectedEntry, processingStage: newStage })
      }
    } catch (error) {
      console.error("Error updating entry stage:", error)
      alert("Error updating entry: " + error.message)
    }
  }

  // Delete entry
  const handleDeleteEntry = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await db.table("cognitiveEntries").delete(id)
        setEntries(entries.filter((entry) => entry.id !== id))

        if (selectedEntry && selectedEntry.id === id) {
          setSelectedEntry(null)
        }
      } catch (error) {
        console.error("Error deleting entry:", error)
        alert("Error deleting entry: " + error.message)
      }
    }
  }

  // Chart data
  const chartData = getVisibleData()

  return (
    <div className="content">
      <div className="bp-tracker-container">
        <h1>Cognitive Journal</h1>

        {/* Chart View */}
        <div className="welcome-section">
          <div className="flex items-center justify-between mb-4">
            <button className="glassmorphic-btn p-2" onClick={() => handleTimeShift("backward")}>
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-4">
              <span className="bg-white/20 px-4 py-2 rounded-full">{getDateRange()}</span>

              <select value={viewMode} onChange={(e) => setViewMode(e.target.value)} className="glassmorphic-select">
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
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area
                  type="monotone"
                  dataKey="intensity"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorIntensity)"
                />
                {chartData.map((entry) => (
                  <ReferenceDot
                    key={entry.id}
                    x={entry.date}
                    y={entry.intensity}
                    r={20}
                    fill="transparent"
                    stroke="none"
                  >
                    <text
                      x={entry.date}
                      y={entry.intensity}
                      dy={-10}
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="20"
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedEntry(entries.find((e) => e.id === entry.id))}
                    >
                      {entry.emotion}
                    </text>
                  </ReferenceDot>
                ))}
              </AreaChart>
            </ResponsiveContainer>

            {/* Processing Stage Indicators */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-around">
              {chartData.map((entry) => {
                const stage = entries.find((e) => e.id === entry.id)?.processingStage
                return (
                  <div
                    key={entry.id}
                    className="h-4 px-2 text-xs rounded-full"
                    style={{
                      backgroundColor:
                        stage === "initial"
                          ? "rgba(239, 68, 68, 0.5)"
                          : stage === "analyzed"
                            ? "rgba(251, 191, 36, 0.5)"
                            : "rgba(52, 211, 153, 0.5)",
                      transform: `translateX(${(chartData.indexOf(entry) / (chartData.length - 1 || 1)) * 100 - 50}%)`,
                    }}
                  >
                    {stage}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button className="glassmorphic-btn" onClick={() => setIsAddingEntry(!isAddingEntry)}>
              {isAddingEntry ? <Check className="mr-2" /> : <Plus className="mr-2" />}
              {isAddingEntry ? "Cancel" : "New Entry"}
            </button>
          </div>
        </div>

        {/* Add/Edit Entry Form */}
        {isAddingEntry && (
          <div className="welcome-section">
            <h2>New Cognitive Journal Entry</h2>

            <div className="form-group">
              <label>Emotion</label>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {EMOTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className={`glassmorphic-btn p-2 text-2xl ${newEntry.emotion === emoji ? "bg-white/30" : ""}`}
                    onClick={() => setNewEntry({ ...newEntry, emotion: emoji })}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Intensity (0-100)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={newEntry.intensity}
                onChange={(e) => setNewEntry({ ...newEntry, intensity: Number.parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between">
                <span>Low</span>
                <span>{newEntry.intensity}%</span>
                <span>High</span>
              </div>
            </div>

            <div className="form-group">
              <label>Thought Pattern</label>
              <select
                value={newEntry.thoughtPattern}
                onChange={(e) => setNewEntry({ ...newEntry, thoughtPattern: e.target.value })}
                className="glassmorphic-select"
              >
                {Object.entries(THOUGHT_PATTERNS).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Situation</label>
              <textarea
                value={newEntry.situation}
                onChange={(e) => setNewEntry({ ...newEntry, situation: e.target.value })}
                placeholder="Describe the situation..."
                className="glassmorphic-select"
              />
            </div>

            <div className="form-group">
              <label>Automatic Thoughts</label>
              <textarea
                value={newEntry.automaticThoughts}
                onChange={(e) => setNewEntry({ ...newEntry, automaticThoughts: e.target.value })}
                placeholder="What thoughts came to mind?"
                className="glassmorphic-select"
              />
            </div>

            <div className="form-group">
              <label>Evidence</label>
              <textarea
                value={newEntry.evidence}
                onChange={(e) => setNewEntry({ ...newEntry, evidence: e.target.value })}
                placeholder="What evidence supports or contradicts these thoughts?"
                className="glassmorphic-select"
              />
            </div>

            <div className="form-group">
              <label>Alternative Thoughts</label>
              <textarea
                value={newEntry.alternativeThoughts}
                onChange={(e) => setNewEntry({ ...newEntry, alternativeThoughts: e.target.value })}
                placeholder="What are some alternative perspectives?"
                className="glassmorphic-select"
              />
            </div>

            <div className="form-group">
              <label>Action Plan</label>
              <textarea
                value={newEntry.actionPlan}
                onChange={(e) => setNewEntry({ ...newEntry, actionPlan: e.target.value })}
                placeholder="What actions can you take based on this analysis?"
                className="glassmorphic-select"
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => setIsAddingEntry(false)} className="secondary-button">
                Cancel
              </button>
              <button type="button" onClick={handleAddEntry} className="glassmorphic-btn">
                Save Entry
              </button>
            </div>
          </div>
        )}

        {/* Selected Entry Details */}
        {selectedEntry && (
          <div className="welcome-section">
            <div className="flex justify-between items-center">
              <h2>Entry Details</h2>
              <button className="glassmorphic-btn p-2" onClick={() => setSelectedEntry(null)}>
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{selectedEntry.emotion}</span>
                  <div>
                    <p>Intensity</p>
                    <p className="text-xl">{selectedEntry.intensity}%</p>
                  </div>
                </div>

                <h3 className="mt-4">Thought Pattern</h3>
                <p>{THOUGHT_PATTERNS[selectedEntry.thoughtPattern]?.label || selectedEntry.thoughtPattern}</p>

                <h3 className="mt-4">Situation</h3>
                <p>{selectedEntry.situation}</p>

                <h3 className="mt-4">Automatic Thoughts</h3>
                <p>{selectedEntry.automaticThoughts}</p>
              </div>

              <div>
                <h3>Evidence</h3>
                <p>{selectedEntry.evidence || "None provided"}</p>

                <h3 className="mt-4">Alternative Thoughts</h3>
                <p>{selectedEntry.alternativeThoughts || "None provided"}</p>

                <h3 className="mt-4">Action Plan</h3>
                <p>{selectedEntry.actionPlan || "None provided"}</p>

                <h3 className="mt-4">Processing Stage</h3>
                <select
                  value={selectedEntry.processingStage}
                  onChange={(e) => updateEntryStage(selectedEntry.id, e.target.value)}
                  className="glassmorphic-select mt-2"
                >
                  <option value="initial">Initial</option>
                  <option value="analyzed">Analyzed</option>
                  <option value="reframed">Reframed</option>
                </select>

                <div className="mt-4">
                  <button
                    className="glassmorphic-btn bg-red-500/20 hover:bg-red-500/30"
                    onClick={() => handleDeleteEntry(selectedEntry.id)}
                  >
                    <Trash2 className="mr-2" />
                    Delete Entry
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Entries List */}
        <div className="welcome-section">
          <h2>Recent Entries</h2>

          {isLoading ? (
            <p>Loading...</p>
          ) : entries.length === 0 ? (
            <p>No entries yet. Add your first entry using the button above.</p>
          ) : (
            <div className="space-y-4">
              {entries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="bp-entry cursor-pointer" onClick={() => setSelectedEntry(entry)}>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{entry.emotion}</span>
                    <div>
                      <p>{new Date(entry.timestamp).toLocaleString()}</p>
                      <p className="text-sm opacity-70">{THOUGHT_PATTERNS[entry.thoughtPattern]?.label}</p>
                    </div>
                  </div>

                  <div className="mt-2">
                    <p className="opacity-80">{entry.situation.slice(0, 100)}...</p>
                  </div>

                  <div className="mt-2 flex justify-between items-center">
                    <div
                      className="px-2 py-1 rounded-full text-xs"
                      style={{
                        backgroundColor:
                          entry.processingStage === "initial"
                            ? "rgba(239, 68, 68, 0.5)"
                            : entry.processingStage === "analyzed"
                              ? "rgba(251, 191, 36, 0.5)"
                              : "rgba(52, 211, 153, 0.5)",
                      }}
                    >
                      {entry.processingStage}
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="bp-entry-action"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedEntry(entry)
                        }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="bp-entry-action delete"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteEntry(entry.id)
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {entries.length > 5 && (
                <div className="text-center mt-4">
                  <button className="glassmorphic-btn" onClick={() => setSelectedEntry(entries[5])}>
                    View More Entries
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

