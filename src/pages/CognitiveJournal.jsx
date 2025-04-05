"use client"

import { useState, useEffect, useRef } from "react"
import { db } from "../db"
import { ChevronLeft, ChevronRight, Edit, Trash2, Calendar, BarChart2, Brain, Activity } from "lucide-react"

export default function CognitiveJournal() {
  // State for journal entries
  const [entries, setEntries] = useState([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState("journal") // journal, calendar, analysis, structured
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [healthStats, setHealthStats] = useState({
    healthPoints: 10,
    healthLevel: 1,
    dayStreak: 3,
    totalSymptoms: 0,
  })
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [bodyPart, setBodyPart] = useState("")
  const [symptomIntensity, setSymptomIntensity] = useState(0)
  const containerRef = useRef(null)

  // New entry form state
  const [newEntry, setNewEntry] = useState({
    content: "",
    tags: [],
    symptoms: [],
    intensity: 0,
    bodyParts: [],
    timestamp: new Date().toISOString(),
    structuredData: {
      subject: "",
      verbType: "",
      verb: "",
      object: "",
      context: "",
    },
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
            cognitiveEntries: "++id, timestamp, content, tags, symptoms, intensity, bodyParts, structuredData",
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

        // Calculate health stats
        calculateHealthStats(loadedEntries)
      } catch (error) {
        console.error("Error loading cognitive entries:", error)
      } finally {
        setIsLoading(false)
      }
    }

    setupDatabase()
  }, [])

  // Calculate health stats based on entries
  const calculateHealthStats = (loadedEntries) => {
    // Simple calculation for demo purposes
    const dayStreak = calculateDayStreak(loadedEntries)
    const totalSymptoms = loadedEntries.reduce((total, entry) => total + (entry.symptoms?.length || 0), 0)
    const healthPoints = Math.min(20, loadedEntries.length + dayStreak)
    const healthLevel = Math.floor(healthPoints / 10) + 1

    setHealthStats({
      healthPoints,
      healthLevel,
      dayStreak,
      totalSymptoms,
    })
  }

  // Calculate day streak
  const calculateDayStreak = (entries) => {
    if (entries.length === 0) return 0

    // Get unique dates from entries
    const dates = entries.map((entry) => {
      const date = new Date(entry.timestamp)
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    })
    const uniqueDates = [...new Set(dates)].sort()

    // Check for consecutive days
    let streak = 1
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`

    // If the most recent entry is not from today, reset streak
    if (uniqueDates[uniqueDates.length - 1] !== todayStr) {
      return 0
    }

    // Count consecutive days
    for (let i = uniqueDates.length - 1; i > 0; i--) {
      const current = new Date(uniqueDates[i].split("-"))
      const prev = new Date(uniqueDates[i - 1].split("-"))
      const diffTime = Math.abs(current - prev)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  // Available cognitive system tags
  const COGNITIVE_TAGS = [
    "Physical Activity",
    "Acoustic",
    "Visual",
    "Language",
    "Emotion",
    "Memory",
    "Focus",
    "Spatial Orientation",
    "Internal Models",
    "Theta Oscillations",
    "Sensory Disengagement",
    "Head-Direction System",
    "Emotional Processing",
    "Object Subsystem",
    "Acoustic Subsystem",
    "Visual Subsystem",
    "Morphophonolexical Subsystem",
  ]

  // Available symptoms
  const SYMPTOMS = [
    { name: "Pain", emoji: "😣" },
    { name: "Fever", emoji: "🤒" },
    { name: "Fatigue", emoji: "😴" },
    { name: "Nausea", emoji: "🤢" },
    { name: "Cough", emoji: "😷" },
  ]

  // Body parts
  const BODY_PARTS = ["Head", "Throat", "Chest", "Stomach", "Back", "Arms", "Legs"]

  // Structured entry options
  const STRUCTURED_OPTIONS = {
    subjects: ["I", "My mind", "My body", "My thoughts"],
    verbTypes: ["Action", "State", "Process", "Perception"],
    verbs: ["feel", "think", "perceive", "remember", "imagine"],
    objects: ["happiness", "sadness", "anxiety", "clarity", "confusion"],
  }

  // Toggle tag selection
  const toggleTag = (tag) => {
    setNewEntry((prev) => {
      const tags = [...prev.tags]
      if (tags.includes(tag)) {
        return { ...prev, tags: tags.filter((t) => t !== tag) }
      } else {
        return { ...prev, tags: [...tags, tag] }
      }
    })
  }

  // Toggle symptom selection
  const toggleSymptom = (symptom) => {
    setSelectedSymptoms((prev) => {
      if (prev.includes(symptom)) {
        return prev.filter((s) => s !== symptom)
      } else {
        return [...prev, symptom]
      }
    })
  }

  // Set body part
  const selectBodyPart = (part) => {
    setBodyPart(part)
  }

  // Add new entry
  const handleAddEntry = async () => {
    if (!newEntry.content.trim() && selectedSymptoms.length === 0 && !newEntry.structuredData.subject) {
      alert("Please add some content to your entry")
      return
    }

    try {
      const entryData = {
        ...newEntry,
        symptoms: selectedSymptoms,
        intensity: symptomIntensity,
        bodyParts: bodyPart ? [bodyPart] : [],
        timestamp: new Date().toISOString(),
      }

      // Add to database
      const id = await db.table("cognitiveEntries").add(entryData)

      // Update state
      const updatedEntries = [{ ...entryData, id }, ...entries]
      setEntries(updatedEntries)
      calculateHealthStats(updatedEntries)

      // Reset form
      setNewEntry({
        content: "",
        tags: [],
        symptoms: [],
        intensity: 0,
        bodyParts: [],
        timestamp: new Date().toISOString(),
        structuredData: {
          subject: "",
          verbType: "",
          verb: "",
          object: "",
          context: "",
        },
      })
      setSelectedSymptoms([])
      setBodyPart("")
      setSymptomIntensity(0)
      setIsAddingEntry(false)
    } catch (error) {
      console.error("Error saving cognitive entry:", error)
      alert("Error saving entry: " + error.message)
    }
  }

  // Delete entry
  const handleDeleteEntry = async (id) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await db.table("cognitiveEntries").delete(id)
        const updatedEntries = entries.filter((entry) => entry.id !== id)
        setEntries(updatedEntries)
        calculateHealthStats(updatedEntries)

        if (selectedEntry && selectedEntry.id === id) {
          setSelectedEntry(null)
        }
      } catch (error) {
        console.error("Error deleting entry:", error)
        alert("Error deleting entry: " + error.message)
      }
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = { weekday: "short", year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Highlight emotional words in text
  const highlightEmotionalWords = (text) => {
    const emotionalWords = ["feel", "happy", "sad", "angry", "anxious", "scared", "excited", "nervous"]
    let highlightedText = text

    emotionalWords.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "gi")
      highlightedText = highlightedText.replace(regex, `<span class="highlighted-emotion">$&</span>`)
    })

    return highlightedText
  }

  // Get entries for calendar view
  const getCalendarEntries = () => {
    const start = new Date(selectedDate)
    start.setDate(start.getDate() - start.getDay()) // Start of week (Sunday)

    const end = new Date(start)
    end.setDate(end.getDate() + 6) // End of week (Saturday)

    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(day.getDate() + i)
      days.push(day)
    }

    return days.map((day) => {
      const dayStr = day.toISOString().split("T")[0]
      const dayEntries = entries.filter((entry) => {
        const entryDate = new Date(entry.timestamp).toISOString().split("T")[0]
        return entryDate === dayStr
      })

      return {
        date: day,
        entries: dayEntries,
      }
    })
  }

  // Render different view modes
  const renderViewContent = () => {
    switch (viewMode) {
      case "calendar":
        return renderCalendarView()
      case "analysis":
        return renderAnalysisView()
      case "structured":
        return renderStructuredView()
      case "symptoms":
        return renderSymptomsView()
      default:
        return renderJournalView()
    }
  }

  // Render journal view
  const renderJournalView = () => {
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <h2>New Entry</h2>
          <div className="flex gap-2">
            <button
              className={`glassmorphic-btn p-2 ${viewMode === "journal" ? "bg-white/30" : ""}`}
              onClick={() => setViewMode("journal")}
            >
              <Edit className="h-4 w-4" />
              <span>Journal</span>
            </button>
            <button
              className={`glassmorphic-btn p-2 ${viewMode === "structured" ? "bg-white/30" : ""}`}
              onClick={() => setViewMode("structured")}
            >
              <Brain className="h-4 w-4" />
              <span>Structured</span>
            </button>
            <button
              className={`glassmorphic-btn p-2 ${viewMode === "symptoms" ? "bg-white/30" : ""}`}
              onClick={() => setViewMode("symptoms")}
            >
              <Activity className="h-4 w-4" />
              <span>Symptoms</span>
            </button>
            <button
              className={`glassmorphic-btn p-2 ${viewMode === "calendar" ? "bg-white/30" : ""}`}
              onClick={() => setViewMode("calendar")}
            >
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </button>
            <button
              className={`glassmorphic-btn p-2 ${viewMode === "analysis" ? "bg-white/30" : ""}`}
              onClick={() => setViewMode("analysis")}
            >
              <BarChart2 className="h-4 w-4" />
              <span>Analysis</span>
            </button>
          </div>
        </div>

        <div className="mb-4">
          <p>Document your thoughts and experiences</p>
          <textarea
            value={newEntry.content}
            onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
            placeholder="Write your journal entry here..."
            className="glassmorphic-select min-h-[200px] w-full mt-2"
          />
        </div>

        <div className="mb-4">
          <h3 className="mb-2">Cognitive System Tags</h3>
          <div className="flex flex-wrap gap-2">
            {COGNITIVE_TAGS.slice(0, 8).map((tag) => (
              <button
                key={tag}
                className={`glassmorphic-btn py-1 px-3 text-sm ${newEntry.tags.includes(tag) ? "bg-white/30" : ""}`}
                onClick={() => toggleTag(tag)}
              >
                {tag} {newEntry.tags.includes(tag) ? "✓" : "+"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button className="glassmorphic-btn" onClick={handleAddEntry}>
            Add Entry
          </button>
        </div>
      </>
    )
  }

  // Render structured view
  const renderStructuredView = () => {
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <h2>New Entry</h2>
          <div className="flex gap-2">
            <button
              className={`glassmorphic-btn p-2 ${viewMode === "journal" ? "bg-white/30" : ""}`}
              onClick={() => setViewMode("journal")}
            >
              <Edit className="h-4 w-4" />
              <span>Journal</span>
            </button>
            <button
              className={`glassmorphic-btn p-2 ${viewMode === "structured" ? "bg-white/30" : ""}`}
              onClick={() => setViewMode("structured")}
            >
              <Brain className="h-4 w-4" />
              <span>Structured</span>
            </button>
            <button
              className={`glassmorphic-btn p-2 ${viewMode === "symptoms" ? "bg-white/30" : ""}`}
              onClick={() => setViewMode("symptoms")}
            >
              <Activity className="h-4 w-4" />
              <span>Symptoms</span>
            </button>
            <button
              className={`glassmorphic-btn p-2 ${viewMode === "calendar" ? "bg-white/30" : ""}`}
              onClick={() => setViewMode("calendar")}
            >
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </button>
            <button
              className={`glassmorphic-btn p-2 ${viewMode === "analysis" ? "bg-white/30" : ""}`}
              onClick={() => setViewMode("analysis")}
            >
              <BarChart2 className="h-4 w-4" />
              <span>Analysis</span>
            </button>
          </div>
        </div>

        <div className="mb-4">
          <p>Build your journal entry using structured components</p>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block mb-2">Subject</label>
              <select
                className="glassmorphic-select w-full"
                value={newEntry.structuredData.subject}
                onChange={(e) =>
                  setNewEntry({
                    ...newEntry,
                    structuredData: {
                      ...newEntry.structuredData,
                      subject: e.target.value,
                    },
                  })
                }
              >
                <option value="">Select subject...</option>
                {STRUCTURED_OPTIONS.subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">Verb Type</label>
              <select
                className="glassmorphic-select w-full"
                value={newEntry.structuredData.verbType}
                onChange={(e) =>
                  setNewEntry({
                    ...newEntry,
                    structuredData: {
                      ...newEntry.structuredData,
                      verbType: e.target.value,
                    },
                  })
                }
              >
                <option value="">Select verb type...</option>
                {STRUCTURED_OPTIONS.verbTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">Verb</label>
              <select
                className="glassmorphic-select w-full"
                value={newEntry.structuredData.verb}
                onChange={(e) =>
                  setNewEntry({
                    ...newEntry,
                    structuredData: {
                      ...newEntry.structuredData,
                      verb: e.target.value,
                    },
                  })
                }
              >
                <option value="">Select verb...</option>
                {STRUCTURED_OPTIONS.verbs.map((verb) => (
                  <option key={verb} value={verb}>
                    {verb}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2">Object</label>
              <select
                className="glassmorphic-select w-full"
                value={newEntry.structuredData.object}
                onChange={(e) =>
                  setNewEntry({
                    ...newEntry,
                    structuredData: {
                      ...newEntry.structuredData,
                      object: e.target.value,
                    },
                  })
                }
              >
                <option value="">Select object...</option>
                {STRUCTURED_OPTIONS.objects.map((object) => (
                  <option key={object} value={object}>
                    {object}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block mb-2">Context (Optional)</label>
            <textarea
              className="glassmorphic-select w-full"
              placeholder="Add context..."
              value={newEntry.structuredData.context}
              onChange={(e) =>
                setNewEntry({
                  ...newEntry,
                  structuredData: {
                    ...newEntry.structuredData,
                    context: e.target.value,
                  },
                })
              }
            />
          </div>

          {newEntry.structuredData.subject && newEntry.structuredData.verb && newEntry.structuredData.object && (
            <div className="mt-4 p-4 bg-white/10 rounded-lg">
              <p className="text-xl">
                {newEntry.structuredData.subject} {newEntry.structuredData.verb} {newEntry.structuredData.object}.
              </p>
              <div className="flex gap-2 mt-2">
                <span className="bg-white/20 px-2 py-1 rounded text-sm">Internal Models</span>
                <span className="bg-white/20 px-2 py-1 rounded text-sm">Emotional Processing</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button className="glassmorphic-btn" onClick={handleAddEntry}>
            Add Entry
          </button>
        </div>
      </>
    )
  }

  // Render symptoms view
  const renderSymptomsView = () => {
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <h2>How are you feeling today?</h2>
          <div className="flex gap-2">
            <button
              className={`glassmorphic-btn p-2 ${viewMode === "journal" ? "bg-white/30" : ""}`}
              onClick={() => setViewMode("journal")}
            >
              <Edit className="h-4 w-4" />
              <span>Journal</span>
            </button>
            <button
              className={`glassmorphic-btn p-2 ${viewMode === "structured" ? "bg-white/30" : ""}`}
              onClick={() => setViewMode("structured")}
            >
              <Brain className="h-4 w-4" />
              <span>Structured</span>
            </button>
            <button
              className={`glassmorphic-btn p-2 ${viewMode === "symptoms" ? "bg-white/30" : ""}`}
              onClick={() => setViewMode("symptoms")}
            >
              <Activity className="h-4 w-4" />
              <span>Symptoms</span>
            </button>
            <button
              className={`glassmorphic-btn p-2 ${viewMode === "calendar" ? "bg-white/30" : ""}`}
              onClick={() => setViewMode("calendar")}
            >
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </button>
            <button
              className={`glassmorphic-btn p-2 ${viewMode === "analysis" ? "bg-white/30" : ""}`}
              onClick={() => setViewMode("analysis")}
            >
              <BarChart2 className="h-4 w-4" />
              <span>Analysis</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 p-4 rounded-lg text-center">
            <Activity className="h-6 w-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{healthStats.healthPoints}</div>
            <div className="text-sm">Health Points</div>
          </div>
          <div className="bg-white/10 p-4 rounded-lg text-center">
            <Activity className="h-6 w-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{healthStats.healthLevel}</div>
            <div className="text-sm">Health Level</div>
          </div>
          <div className="bg-white/10 p-4 rounded-lg text-center">
            <Calendar className="h-6 w-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{healthStats.dayStreak}</div>
            <div className="text-sm">Day Streak</div>
          </div>
          <div className="bg-white/10 p-4 rounded-lg text-center">
            <Activity className="h-6 w-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{healthStats.totalSymptoms}</div>
            <div className="text-sm">Total Symptoms</div>
          </div>
        </div>

        <div className="mb-4">
          <textarea
            placeholder="Describe your symptoms..."
            className="glassmorphic-select min-h-[100px] w-full"
            value={newEntry.content}
            onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
          />
        </div>

        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {SYMPTOMS.map((symptom) => (
              <button
                key={symptom.name}
                className={`glassmorphic-btn py-2 px-4 ${selectedSymptoms.includes(symptom.name) ? "bg-white/30" : ""}`}
                onClick={() => toggleSymptom(symptom.name)}
              >
                <span className="mr-2">{symptom.emoji}</span>
                {symptom.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="mb-2">Where does it hurt?</h3>
          <div className="grid grid-cols-3 gap-2">
            {BODY_PARTS.map((part) => (
              <button
                key={part}
                className={`glassmorphic-btn py-2 ${bodyPart === part ? "bg-white/30" : ""}`}
                onClick={() => selectBodyPart(part)}
              >
                {part}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <h3 className="mb-2">Symptom Intensity</h3>
          <input
            type="range"
            min="0"
            max="10"
            value={symptomIntensity}
            onChange={(e) => setSymptomIntensity(Number.parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm">
            <span>0</span>
            <span>Intensity: {symptomIntensity} / 10</span>
            <span>10</span>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="glassmorphic-btn" onClick={handleAddEntry}>
            Add Symptom (+5 health points)
          </button>
        </div>
      </>
    )
  }

  // Render calendar view
  const renderCalendarView = () => {
    const calendarEntries = getCalendarEntries()
    const dateRange = `${calendarEntries[0].date.toLocaleDateString()} - ${calendarEntries[6].date.toLocaleDateString()}`

    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <button
            className="glassmorphic-btn p-2"
            onClick={() => {
              const newDate = new Date(selectedDate)
              newDate.setDate(newDate.getDate() - 7)
              setSelectedDate(newDate)
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-4">
            <span className="bg-white/20 px-4 py-2 rounded-full">{dateRange}</span>

            <div className="flex gap-2">
              <button
                className={`glassmorphic-btn p-2 ${viewMode === "journal" ? "bg-white/30" : ""}`}
                onClick={() => setViewMode("journal")}
              >
                <Edit className="h-4 w-4" />
                <span>Journal</span>
              </button>
              <button
                className={`glassmorphic-btn p-2 ${viewMode === "structured" ? "bg-white/30" : ""}`}
                onClick={() => setViewMode("structured")}
              >
                <Brain className="h-4 w-4" />
                <span>Structured</span>
              </button>
              <button
                className={`glassmorphic-btn p-2 ${viewMode === "symptoms" ? "bg-white/30" : ""}`}
                onClick={() => setViewMode("symptoms")}
              >
                <Activity className="h-4 w-4" />
                <span>Symptoms</span>
              </button>
              <button
                className={`glassmorphic-btn p-2 ${viewMode === "calendar" ? "bg-white/30" : ""}`}
                onClick={() => setViewMode("calendar")}
              >
                <Calendar className="h-4 w-4" />
                <span>Calendar</span>
              </button>
              <button
                className={`glassmorphic-btn p-2 ${viewMode === "analysis" ? "bg-white/30" : ""}`}
                onClick={() => setViewMode("analysis")}
              >
                <BarChart2 className="h-4 w-4" />
                <span>Analysis</span>
              </button>
            </div>
          </div>

          <button
            className="glassmorphic-btn p-2"
            onClick={() => {
              const newDate = new Date(selectedDate)
              newDate.setDate(newDate.getDate() + 7)
              setSelectedDate(newDate)
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-4">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center p-2 bg-white/10 rounded-t-lg">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 h-[400px]">
          {calendarEntries.map((dayData, index) => (
            <div
              key={index}
              className="bg-white/5 p-2 h-full overflow-hidden relative"
              onClick={() => {
                if (dayData.entries.length > 0) {
                  setSelectedEntry(dayData.entries[0])
                }
              }}
            >
              <div className="text-sm opacity-70">{dayData.date.getDate()}</div>

              {dayData.entries.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2 justify-center">
                  {dayData.entries.map((entry, i) => {
                    // Show emojis for symptoms
                    if (entry.symptoms && entry.symptoms.length > 0) {
                      return entry.symptoms.map((symptom, j) => {
                        const matchingSymptom = SYMPTOMS.find((s) => s.name === symptom)
                        return (
                          <span key={`${i}-${j}`} className="text-xl" title={symptom}>
                            {matchingSymptom ? matchingSymptom.emoji : "😐"}
                          </span>
                        )
                      })
                    }

                    // Show a default emoji for entries without symptoms
                    return (
                      <span key={i} className="text-xl">
                        😊
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </>
    )
  }

  // Render analysis view
  const renderAnalysisView = () => {
    // Count tags
    const tagCounts = {}
    entries.forEach((entry) => {
      if (entry.tags) {
        entry.tags.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      }
    })

    // Count symptoms
    const symptomCounts = {}
    entries.forEach((entry) => {
      if (entry.symptoms) {
        entry.symptoms.forEach((symptom) => {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1
        })
      }
    })

    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <h2>Analysis</h2>
          <div className="flex gap-2">
            <button
              className={`glassmorphic-btn p-2 ${viewMode === "journal" ? "bg-white/30" : ""}`}
              onClick={() => setViewMode("journal")}
            >
              <Edit className="h-4 w-4" />
              <span>Journal</span>
            </button>
            <button
              className={`glassmorphic-btn p-2 ${viewMode === "structured" ? "bg-white/30" : ""}`}
              onClick={() => setViewMode("structured")}
            >
              <Brain className="h-4 w-4" />
              <span>Structured</span>
            </button>
            <button
              className={`glassmorphic-btn p-2 ${viewMode === "symptoms" ? "bg-white/30" : ""}`}
              onClick={() => setViewMode("symptoms")}
            >
              <Activity className="h-4 w-4" />
              <span>Symptoms</span>
            </button>
            <button
              className={`glassmorphic-btn p-2 ${viewMode === "calendar" ? "bg-white/30" : ""}`}
              onClick={() => setViewMode("calendar")}
            >
              <Calendar className="h-4 w-4" />
              <span>Calendar</span>
            </button>
            <button
              className={`glassmorphic-btn p-2 ${viewMode === "analysis" ? "bg-white/30" : ""}`}
              onClick={() => setViewMode("analysis")}
            >
              <BarChart2 className="h-4 w-4" />
              <span>Analysis</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 p-4 rounded-lg">
            <h3 className="mb-4">Cognitive System Tags</h3>
            {Object.entries(tagCounts).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(tagCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([tag, count]) => (
                    <div key={tag} className="flex justify-between items-center">
                      <span>{tag}</span>
                      <div className="flex-1 mx-4 bg-white/10 h-4 rounded-full overflow-hidden">
                        <div
                          className="bg-white/30 h-full"
                          style={{ width: `${(count / Math.max(...Object.values(tagCounts))) * 100}%` }}
                        />
                      </div>
                      <span>{count}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p>No tags recorded yet</p>
            )}
          </div>

          <div className="bg-white/10 p-4 rounded-lg">
            <h3 className="mb-4">Symptoms</h3>
            {Object.entries(symptomCounts).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(symptomCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([symptom, count]) => {
                    const matchingSymptom = SYMPTOMS.find((s) => s.name === symptom)
                    return (
                      <div key={symptom} className="flex justify-between items-center">
                        <span>
                          {matchingSymptom && <span className="mr-2">{matchingSymptom.emoji}</span>}
                          {symptom}
                        </span>
                        <div className="flex-1 mx-4 bg-white/10 h-4 rounded-full overflow-hidden">
                          <div
                            className="bg-white/30 h-full"
                            style={{ width: `${(count / Math.max(...Object.values(symptomCounts))) * 100}%` }}
                          />
                        </div>
                        <span>{count}</span>
                      </div>
                    )
                  })}
              </div>
            ) : (
              <p>No symptoms recorded yet</p>
            )}
          </div>
        </div>

        <div className="mt-6 bg-white/10 p-4 rounded-lg">
          <h3 className="mb-4">Recent Entries</h3>
          {entries.slice(0, 5).map((entry) => (
            <div
              key={entry.id}
              className="p-3 bg-white/5 rounded-lg mb-2 cursor-pointer"
              onClick={() => setSelectedEntry(entry)}
            >
              <div className="flex justify-between">
                <span className="text-sm opacity-70">{formatDate(entry.timestamp)}</span>
                {entry.symptoms && entry.symptoms.length > 0 && (
                  <div className="flex gap-1">
                    {entry.symptoms.map((symptom) => {
                      const matchingSymptom = SYMPTOMS.find((s) => s.name === symptom)
                      return (
                        <span key={symptom} title={symptom}>
                          {matchingSymptom ? matchingSymptom.emoji : "😐"}
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>
              <div className="mt-1">
                {entry.content ? (
                  <p className="line-clamp-2">{entry.content}</p>
                ) : entry.structuredData?.subject ? (
                  <p>
                    {entry.structuredData.subject} {entry.structuredData.verb} {entry.structuredData.object}.
                  </p>
                ) : (
                  <p className="italic opacity-70">No content</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }

  return (
    <div className="content">
      <div className="bp-tracker-container">
        <h1>Cognitive Journal</h1>

        {/* Main Content */}
        <div
          className="welcome-section"
          style={{ background: "linear-gradient(to bottom, #4AC29A, #4ECDC4, #F7D794)" }}
        >
          {renderViewContent()}
        </div>

        {/* Selected Entry Details */}
        {selectedEntry && (
          <div className="welcome-section">
            <div className="flex justify-between items-center">
              <h2>Entry Details</h2>
              <button className="glassmorphic-btn p-2" onClick={() => setSelectedEntry(null)}>
                ✕
              </button>
            </div>

            <div className="mt-4">
              <p className="text-sm opacity-70">{formatDate(selectedEntry.timestamp)}</p>

              {selectedEntry.content && (
                <div className="mt-2 p-4 bg-white/5 rounded-lg">
                  <div dangerouslySetInnerHTML={{ __html: highlightEmotionalWords(selectedEntry.content) }} />
                </div>
              )}

              {selectedEntry.structuredData?.subject && (
                <div className="mt-2 p-4 bg-white/5 rounded-lg">
                  <p className="text-xl">
                    {selectedEntry.structuredData.subject} {selectedEntry.structuredData.verb}{" "}
                    {selectedEntry.structuredData.object}.
                  </p>
                  {selectedEntry.structuredData.context && (
                    <p className="mt-2 opacity-80">{selectedEntry.structuredData.context}</p>
                  )}
                </div>
              )}

              {selectedEntry.symptoms && selectedEntry.symptoms.length > 0 && (
                <div className="mt-4">
                  <h3>Symptoms</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedEntry.symptoms.map((symptom) => {
                      const matchingSymptom = SYMPTOMS.find((s) => s.name === symptom)
                      return (
                        <div key={symptom} className="bg-white/10 px-3 py-1 rounded-full">
                          {matchingSymptom && <span className="mr-2">{matchingSymptom.emoji}</span>}
                          {symptom}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {selectedEntry.bodyParts && selectedEntry.bodyParts.length > 0 && (
                <div className="mt-4">
                  <h3>Affected Areas</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedEntry.bodyParts.map((part) => (
                      <div key={part} className="bg-white/10 px-3 py-1 rounded-full">
                        {part}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedEntry.intensity > 0 && (
                <div className="mt-4">
                  <h3>Intensity: {selectedEntry.intensity}/10</h3>
                  <div className="w-full bg-white/10 h-4 rounded-full mt-2 overflow-hidden">
                    <div className="bg-white/30 h-full" style={{ width: `${(selectedEntry.intensity / 10) * 100}%` }} />
                  </div>
                </div>
              )}

              {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                <div className="mt-4">
                  <h3>Cognitive Tags</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedEntry.tags.map((tag) => (
                      <div key={tag} className="bg-white/10 px-3 py-1 rounded-full">
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-6">
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
        )}

        {/* Recent Entries */}
        <div className="welcome-section">
          <h2>Recent Entries</h2>

          {isLoading ? (
            <p>Loading...</p>
          ) : entries.length === 0 ? (
            <p>No entries yet. Add your first entry using one of the methods above.</p>
          ) : (
            <div className="space-y-4">
              {entries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="bp-entry cursor-pointer" onClick={() => setSelectedEntry(entry)}>
                  <div className="flex justify-between">
                    <p>{formatDate(entry.timestamp)}</p>

                    {entry.symptoms && entry.symptoms.length > 0 && (
                      <div className="flex gap-1">
                        {entry.symptoms.map((symptom) => {
                          const matchingSymptom = SYMPTOMS.find((s) => s.name === symptom)
                          return (
                            <span key={symptom} title={symptom}>
                              {matchingSymptom ? matchingSymptom.emoji : "😐"}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div className="mt-2">
                    {entry.content ? (
                      <p className="line-clamp-2">{entry.content}</p>
                    ) : entry.structuredData?.subject ? (
                      <p>
                        {entry.structuredData.subject} {entry.structuredData.verb} {entry.structuredData.object}.
                      </p>
                    ) : (
                      <p className="italic opacity-70">No content</p>
                    )}
                  </div>

                  <div className="mt-2 flex justify-between items-center">
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-xs bg-white/10 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                        {entry.tags.length > 3 && (
                          <span className="text-xs bg-white/10 px-2 py-1 rounded">+{entry.tags.length - 3} more</span>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
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

