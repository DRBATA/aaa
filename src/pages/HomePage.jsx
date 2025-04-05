"use client"

import { useState, useEffect } from "react"
import {
  Shield,
  Stethoscope,
  Lock,
  OptionIcon as OTCIcon,
  StickerIcon as StrepIcon,
  BookIcon,
  Info,
  Heart,
  Brain,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { db } from "../db"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

// Wellness activities data
const categories = [
  {
    id: 1,
    name: "Meditation",
    description: "Practices to calm the mind and increase awareness",
  },
  {
    id: 2,
    name: "Stretching",
    description: "Exercises to improve flexibility and reduce tension",
  },
  {
    id: 3,
    name: "Rehabilitation",
    description: "Exercises designed for recovery and healing",
  },
  {
    id: 4,
    name: "Movement",
    description: "Activities involving walking and physical movement",
  },
  {
    id: 5,
    name: "Poetry",
    description: "Reading and reflecting on poems for mental wellbeing",
  },
  {
    id: 6,
    name: "Games",
    description: "Playful activities to stimulate the mind",
  },
]

const activities = [
  {
    id: 1,
    name: "Mindful Breathing",
    description: "A simple meditation focusing on the breath to calm the mind and reduce stress.",
    duration: 10,
    imageUrl: "/placeholder.svg?height=400&width=600",
    categoryIds: [1],
    forHighBP: true,
    forLowMood: true,
    chemicals: [
      {
        name: "Endorphins",
        effect: "Natural pain relievers that also trigger positive feelings",
      },
      {
        name: "GABA",
        effect: "Reduces neuronal excitability throughout the nervous system",
      },
    ],
    benefits: [
      "Reduces stress and anxiety",
      "Improves focus and concentration",
      "Lowers blood pressure",
      "Enhances self-awareness",
    ],
  },
  {
    id: 2,
    name: "Gentle Neck Stretches",
    description: "A series of gentle stretches to release tension in the neck and shoulders.",
    duration: 5,
    imageUrl: "/placeholder.svg?height=400&width=600",
    categoryIds: [2, 3],
    forHighBP: true,
    forLowMood: false,
    chemicals: [
      {
        name: "Endorphins",
        effect: "Reduces pain perception and creates a sense of wellbeing",
      },
      {
        name: "Serotonin",
        effect: "Contributes to feelings of wellbeing and happiness",
      },
    ],
    benefits: [
      "Relieves neck and shoulder tension",
      "Improves range of motion",
      "Reduces headaches",
      "Decreases stress",
    ],
  },
  {
    id: 3,
    name: "Nature Walk",
    description: "A mindful walk in nature to boost mood and energy levels.",
    duration: 30,
    imageUrl: "/placeholder.svg?height=400&width=600",
    categoryIds: [4],
    forHighBP: false,
    forLowMood: true,
    chemicals: [
      {
        name: "Endocannabinoids",
        effect: "Creates a sense of calm and reduced anxiety",
      },
      {
        name: "Dopamine",
        effect: "Provides feelings of reward and pleasure",
      },
    ],
    benefits: [
      "Boosts mood and energy",
      "Reduces stress and anxiety",
      "Improves cardiovascular health",
      "Enhances creativity and problem-solving",
    ],
  },
  {
    id: 4,
    name: 'Reading "The Peace of Wild Things"',
    description: "Reading and reflecting on Wendell Berry's poem about finding peace in nature.",
    duration: 15,
    imageUrl: "/placeholder.svg?height=400&width=600",
    categoryIds: [5],
    forHighBP: true,
    forLowMood: true,
    chemicals: [
      {
        name: "Oxytocin",
        effect: "Creates feelings of bonding and emotional connection",
      },
      {
        name: "Serotonin",
        effect: "Regulates mood and promotes feelings of wellbeing",
      },
    ],
    benefits: [
      "Reduces stress through emotional connection",
      "Provides perspective on personal struggles",
      "Encourages mindfulness and presence",
      "Fosters connection with nature",
    ],
  },
  {
    id: 5,
    name: "Memory Match Game",
    description: "A card-matching game that improves memory and concentration.",
    duration: 20,
    imageUrl: "/placeholder.svg?height=400&width=600",
    categoryIds: [6],
    forHighBP: false,
    forLowMood: true,
    chemicals: [
      {
        name: "Dopamine",
        effect: "Released when finding matches, creating feelings of reward",
      },
      {
        name: "Acetylcholine",
        effect: "Supports memory formation and attention",
      },
    ],
    benefits: [
      "Improves short-term memory",
      "Enhances concentration",
      "Reduces stress through focused attention",
      "Provides mental stimulation",
    ],
  },
  {
    id: 6,
    name: "Lower Back Rehabilitation",
    description: "Gentle exercises designed to strengthen and relieve lower back pain.",
    duration: 15,
    imageUrl: "/placeholder.svg?height=400&width=600",
    categoryIds: [2, 3],
    forHighBP: false,
    forLowMood: false,
    chemicals: [
      {
        name: "Endorphins",
        effect: "Natural pain relievers that reduce discomfort",
      },
      {
        name: "IGF-1",
        effect: "Supports muscle repair and growth",
      },
    ],
    benefits: ["Reduces lower back pain", "Strengthens core muscles", "Improves posture", "Increases mobility"],
  },
  {
    id: 7,
    name: "Body Scan Meditation",
    description: "A meditation practice that involves focusing attention on different parts of the body.",
    duration: 20,
    imageUrl: "/placeholder.svg?height=400&width=600",
    categoryIds: [1],
    forHighBP: true,
    forLowMood: true,
    chemicals: [
      {
        name: "GABA",
        effect: "Promotes relaxation and reduces anxiety",
      },
      {
        name: "Serotonin",
        effect: "Improves mood and sense of wellbeing",
      },
    ],
    benefits: [
      "Reduces physical tension",
      "Increases body awareness",
      "Improves sleep quality",
      "Decreases stress and anxiety",
    ],
  },
  {
    id: 8,
    name: "Word Association Game",
    description: "A mental game that stimulates creativity and cognitive connections.",
    duration: 10,
    imageUrl: "/placeholder.svg?height=400&width=600",
    categoryIds: [6],
    forHighBP: false,
    forLowMood: true,
    chemicals: [
      {
        name: "Dopamine",
        effect: "Released during creative thinking and problem-solving",
      },
      {
        name: "Norepinephrine",
        effect: "Enhances alertness and attention",
      },
    ],
    benefits: [
      "Stimulates creative thinking",
      "Strengthens neural connections",
      "Improves verbal fluency",
      "Provides mental stimulation",
    ],
  },
  {
    id: 9,
    name: "Shoulder Mobility Exercises",
    description: "A series of movements to improve shoulder range of motion and reduce stiffness.",
    duration: 10,
    imageUrl: "/placeholder.svg?height=400&width=600",
    categoryIds: [2, 3],
    forHighBP: false,
    forLowMood: false,
    chemicals: [
      {
        name: "Endorphins",
        effect: "Reduces pain and creates a sense of wellbeing",
      },
      {
        name: "Substance P (reduction)",
        effect: "Decreases pain signals to the brain",
      },
    ],
    benefits: [
      "Increases shoulder mobility",
      "Reduces risk of injury",
      "Decreases shoulder and neck tension",
      "Improves posture",
    ],
  },
]

// Helper function to shuffle array
function shuffleArray(array) {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export default function HomePage() {
  const [shuffledActivities, setShuffledActivities] = useState([])
  const [recentBPReading, setRecentBPReading] = useState(null)
  const [recentMoodEntry, setRecentMoodEntry] = useState(null)
  const [hasHighBP, setHasHighBP] = useState(false)
  const [hasLowMood, setHasLowMood] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [medications, setMedications] = useState([])
  const [viewType, setViewType] = useState("month")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [bpReadings, setBpReadings] = useState([])

  useEffect(() => {
    // Shuffle activities on component mount
    setShuffledActivities(shuffleArray(activities))

    // Load recent BP and mood data
    async function loadRecentData() {
      try {
        // Load recent BP reading
        if (db.tables.some((t) => t.name === "bpLogs")) {
          const bpLogs = await db.table("bpLogs").toArray()
          if (bpLogs.length > 0) {
            // Sort by date and get most recent
            const sortedLogs = bpLogs.sort((a, b) => new Date(b.date) - new Date(a.date))
            setRecentBPReading(sortedLogs[0])
            setBpReadings(sortedLogs)

            // Check if BP is high (systolic > 130 or diastolic > 85)
            setHasHighBP(sortedLogs[0].systolic > 130 || sortedLogs[0].diastolic > 85)
          }
        }

        // Load recent cognitive/mood entry
        if (db.tables.some((t) => t.name === "cognitiveEntries")) {
          const entries = await db.table("cognitiveEntries").toArray()
          if (entries.length > 0) {
            // Sort by timestamp and get most recent
            const sortedEntries = entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            setRecentMoodEntry(sortedEntries[0])

            // Check for low mood indicators in content or tags
            const lowMoodKeywords = ["sad", "depressed", "anxious", "tired", "stressed", "worried"]
            const hasLowMoodContent =
              sortedEntries[0].content &&
              lowMoodKeywords.some((keyword) => sortedEntries[0].content.toLowerCase().includes(keyword))

            const hasLowMoodTags =
              sortedEntries[0].tags &&
              sortedEntries[0].tags.some(
                (tag) => tag.toLowerCase().includes("emotion") || tag.toLowerCase().includes("processing"),
              )

            setHasLowMood(hasLowMoodContent || hasLowMoodTags)
          }
        }

        // Load medications
        if (db.tables.some((t) => t.name === "medications")) {
          const meds = await db.table("medications").toArray()
          setMedications(meds)
        }
      } catch (error) {
        console.error("Error loading recent data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRecentData()
  }, [])

  // Filter activities based on BP and mood
  const getRecommendedActivities = () => {
    let recommended = []

    if (hasHighBP && hasLowMood) {
      recommended = activities.filter((a) => a.forHighBP && a.forLowMood)
    } else if (hasHighBP) {
      recommended = activities.filter((a) => a.forHighBP)
    } else if (hasLowMood) {
      recommended = activities.filter((a) => a.forLowMood)
    } else {
      // If no specific conditions, return 3 random activities
      return shuffledActivities.slice(0, 3)
    }

    // Shuffle the filtered recommendations
    return shuffleArray(recommended).slice(0, 3)
  }

  // Get date range for chart
  const getDateRange = () => {
    const start = new Date(currentDate)
    const end = new Date(currentDate)

    if (viewType === "month") {
      start.setDate(1)
      end.setMonth(end.getMonth() + 1, 0)
    } else {
      start.setDate(start.getDate() - 7)
    }

    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
  }

  // Handle time shift
  const handleTimeShift = (direction) => {
    const newDate = new Date(currentDate)
    if (viewType === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === "forward" ? 1 : -1))
    } else {
      newDate.setDate(newDate.getDate() + (direction === "forward" ? 7 : -7))
    }
    setCurrentDate(newDate)
  }

  // Get visible data for chart
  const getVisibleData = () => {
    const start = new Date(currentDate)
    const end = new Date(currentDate)

    if (viewType === "month") {
      start.setDate(1)
      end.setMonth(end.getMonth() + 1, 0)
    } else {
      start.setDate(start.getDate() - 7)
    }

    return bpReadings
      .filter((reading) => {
        const readingDate = new Date(reading.date)
        return readingDate >= start && readingDate <= end
      })
      .map((reading) => ({
        date: new Date(reading.date).toLocaleDateString(),
        systolic: Number(reading.systolic),
        diastolic: Number(reading.diastolic),
        pulse: Number(reading.pulse || 0),
        id: reading.id,
      }))
  }

  // Get medication position for timeline
  const getMedicationPosition = (medication) => {
    if (!medication.startDate) return { start: 0, end: 100 }

    const start = new Date(currentDate)
    const end = new Date(currentDate)

    if (viewType === "month") {
      start.setDate(1)
      end.setMonth(end.getMonth() + 1, 0)
    } else {
      start.setDate(start.getDate() - 7)
    }

    const medStart = new Date(medication.startDate)
    const medEnd = medication.endDate ? new Date(medication.endDate) : new Date()

    const totalDays = (end - start) / (1000 * 60 * 60 * 24)
    const startOffset = Math.max(0, (medStart - start) / (1000 * 60 * 60 * 24))
    const endOffset = Math.min(totalDays, (medEnd - start) / (1000 * 60 * 60 * 24))

    return {
      start: (startOffset / totalDays) * 100,
      end: (endOffset / totalDays) * 100,
    }
  }

  const recommendedActivities = getRecommendedActivities()
  const chartData = getVisibleData()

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to EasyGP</h1>
        <p className="subtitle">
          EasyGP is your privacy-first health tool for symptom logging, intelligent diagnostics, and over-the-counter
          treatment guidance. Explore our new features:
        </p>
      </div>

      {/* BP Visualization */}
      {bpReadings.length > 0 && (
        <div className="welcome-section mb-6">
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

          <div className="chart-container">
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
                <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="pulse" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>

            {/* Medication Timeline */}
            <div className="absolute bottom-0 left-0 right-0 h-12 flex items-end">
              {medications.map((med, index) => {
                const position = getMedicationPosition(med)
                return (
                  <div
                    key={med.id}
                    className="h-6 absolute"
                    style={{
                      left: `${position.start}%`,
                      width: `${position.end - position.start}%`,
                      bottom: index * 8 + "px",
                      backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
                      borderRadius: "2px",
                    }}
                    title={`${med.name} ${med.dosage}`}
                  >
                    <span className="text-xs whitespace-nowrap overflow-hidden text-white px-1">{med.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Health Status Summary */}
      {(recentBPReading || recentMoodEntry) && (
        <div className="welcome-section mb-6">
          <h2 className="text-xl font-bold mb-4">Your Health Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentBPReading && (
              <div className="bg-white/10 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="text-red-400" />
                  <h3 className="font-semibold">Recent Blood Pressure</h3>
                </div>
                <p className="text-xl">
                  {recentBPReading.systolic}/{recentBPReading.diastolic} mmHg
                </p>
                <p className="text-sm opacity-70">Recorded on {new Date(recentBPReading.date).toLocaleDateString()}</p>
                <div className="mt-2">
                  {hasHighBP ? (
                    <span className="bg-red-400/20 text-red-100 px-2 py-1 rounded text-sm">
                      <ThumbsDown className="inline-block h-4 w-4 mr-1" />
                      Elevated
                    </span>
                  ) : (
                    <span className="bg-green-400/20 text-green-100 px-2 py-1 rounded text-sm">
                      <ThumbsUp className="inline-block h-4 w-4 mr-1" />
                      Normal
                    </span>
                  )}
                </div>
              </div>
            )}

            {recentMoodEntry && (
              <div className="bg-white/10 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="text-blue-400" />
                  <h3 className="font-semibold">Recent Mood Entry</h3>
                </div>
                <p className="line-clamp-2">
                  {recentMoodEntry.content
                    ? recentMoodEntry.content
                    : recentMoodEntry.structuredData?.subject
                      ? `${recentMoodEntry.structuredData.subject} ${recentMoodEntry.structuredData.verb} ${recentMoodEntry.structuredData.object}`
                      : "No content"}
                </p>
                <p className="text-sm opacity-70">
                  Recorded on {new Date(recentMoodEntry.timestamp).toLocaleDateString()}
                </p>
                <div className="mt-2">
                  {hasLowMood ? (
                    <span className="bg-yellow-400/20 text-yellow-100 px-2 py-1 rounded text-sm">
                      <Frown className="inline-block h-4 w-4 mr-1" />
                      Could use a boost
                    </span>
                  ) : (
                    <span className="bg-green-400/20 text-green-100 px-2 py-1 rounded text-sm">
                      <Smile className="inline-block h-4 w-4 mr-1" />
                      Positive
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recommended Activities */}
      {!isLoading && (
        <div className="welcome-section mb-6">
          <h2 className="text-xl font-bold mb-4">
            {hasHighBP && hasLowMood
              ? "Recommended for Your Blood Pressure & Mood"
              : hasHighBP
                ? "Recommended for Your Blood Pressure"
                : hasLowMood
                  ? "Recommended for Your Mood"
                  : "Activities You Might Enjoy"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedActivities.map((activity) => (
              <div key={activity.id} className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-semibold">{activity.name}</h3>
                <p className="text-sm mb-2">{activity.duration} minutes</p>
                <p className="mb-2">{activity.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {activity.benefits.slice(0, 2).map((benefit, index) => (
                    <span key={index} className="bg-white/10 px-2 py-1 rounded text-xs">
                      {benefit}
                    </span>
                  ))}
                </div>
                {activity.forHighBP && hasHighBP && (
                  <div className="mt-2">
                    <span className="bg-blue-400/20 text-blue-100 px-2 py-1 rounded text-xs">
                      Good for blood pressure
                    </span>
                  </div>
                )}
                {activity.forLowMood && hasLowMood && (
                  <div className="mt-2">
                    <span className="bg-purple-400/20 text-purple-100 px-2 py-1 rounded text-xs">Mood enhancing</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="features-grid">
        {/* Ethical and Privacy Section */}
        <div className="feature-card">
          <div className="card-icon">
            <Shield size={32} />
          </div>
          <h2>Ethical Guidance & Security</h2>
          <p>
            We ensure your data remains private with no tracking, while providing ethical and secure health management.
          </p>
        </div>

        {/* Symptom Logging & Diagnostics Section */}
        <div className="feature-card">
          <div className="card-icon">
            <Stethoscope size={32} />
          </div>
          <h2>Symptom Logging & Analysis</h2>
          <p>Log your symptoms easily and receive intelligent analysis for better self-monitoring.</p>
        </div>

        {/* Data Privacy Section */}
        <div className="feature-card">
          <div className="card-icon">
            <Lock size={32} />
          </div>
          <h2>Data Privacy & Security</h2>
          <p>Your health data stays with you – secure, offline, and completely private.</p>
        </div>

        {/* OTC Guide Section */}
        <div className="feature-card">
          <div className="card-icon">
            <OTCIcon size={32} />
          </div>
          <h2>OTC Guide</h2>
          <p>
            Discover over‑the‑counter treatment options with detailed advice and QR code generation to share with your
            pharmacist.
          </p>
        </div>

        {/* Strep Tool Section */}
        <div className="feature-card">
          <div className="card-icon">
            <StrepIcon size={32} />
          </div>
          <h2>Strep Tool</h2>
          <p>
            Manage your symptom logs, import/export your data, and get recommendations for testing, tracking, or
            treatment.
          </p>
        </div>

        {/* Book Now Section */}
        <div className="feature-card">
          <div className="card-icon">
            <BookIcon size={32} />
          </div>
          <h2>Book Now</h2>
          <p>Soon you'll be able to request tests, prescriptions, or further consultations directly from the app.</p>
        </div>

        {/* Info/Additional Section */}
        <div className="feature-card">
          <div className="card-icon">
            <Info size={32} />
          </div>
          <h2>What's New?</h2>
          <p>
            Explore our updated navigation bar featuring separate installation options: Windows/Android via the install
            button and iOS installation instructions.
          </p>
        </div>
      </div>
    </div>
  )
}

