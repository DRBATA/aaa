"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { db } from "../db";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

// ----- Dummy Data: Categories & Activities -----
const categories = [
  { id: 1, name: "Meditation", description: "Practices to calm the mind and increase awareness" },
  { id: 2, name: "Stretching", description: "Exercises to improve flexibility and reduce tension" },
  { id: 3, name: "Rehabilitation", description: "Exercises designed for recovery and healing" },
  { id: 4, name: "Movement", description: "Activities involving walking and physical movement" },
  { id: 5, name: "Poetry", description: "Reading and reflecting on poems for mental wellbeing" },
  { id: 6, name: "Games", description: "Playful activities to stimulate the mind" },
];

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
      { name: "Endorphins", effect: "Natural pain relievers and mood boosters" },
      { name: "GABA", effect: "Reduces neuronal excitability" },
    ],
    benefits: ["Reduces stress", "Lowers blood pressure", "Enhances focus"],
  },
  {
    id: 2,
    name: "Gentle Neck Stretches",
    description: "Stretches to release tension in the neck and shoulders.",
    duration: 5,
    imageUrl: "/placeholder.svg?height=400&width=600",
    categoryIds: [2, 3],
    forHighBP: true,
    forLowMood: false,
    chemicals: [
      { name: "Endorphins", effect: "Reduces pain perception" },
      { name: "Serotonin", effect: "Enhances wellbeing" },
    ],
    benefits: ["Relieves tension", "Improves range of motion", "Decreases headaches"],
  },
  // ... additional activities here ...
];

// ----- Helper Functions -----
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Risk calculation placeholder functions
function calculateQRisk(age, cholesterol) {
  return Math.min(age * 0.5 + cholesterol * 0.2, 100);
}
function calculateCancerRisk(age, gender) {
  return Math.min(age * (gender === "male" ? 0.3 : 0.25), 100);
}
function calculateDiabetesRisk(age, bmi) {
  return Math.min(age * 0.4 + bmi * 0.6, 100);
}
function calculateDementiaRisk(age) {
  return Math.min(age * 0.7, 100);
}
function calculateFRAX(age, weight, height) {
  return Math.min(age * 0.3 + (weight / height) * 10, 100);
}
function calculateABCD2(age, bp, clinical, duration, diabetes) {
  return (age >= 60 ? 1 : 0) + (bp > 140 ? 1 : 0) + clinical + (duration >= 60 ? 2 : 1) + diabetes;
}
function calculateORBIT(age, hemoglobin, renal) {
  return (age > 75 ? 2 : 1) + (hemoglobin < 13 ? 2 : 0) + (renal < 60 ? 2 : 0);
}

export default function HomePage() {
  // ----- State Variables -----
  const [shuffledActivities, setShuffledActivities] = useState([]);
  const [recentBPReading, setRecentBPReading] = useState(null);
  const [recentMoodEntry, setRecentMoodEntry] = useState(null);
  const [hasHighBP, setHasHighBP] = useState(false);
  const [hasLowMood, setHasLowMood] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [medications, setMedications] = useState([]);
  const [viewType, setViewType] = useState("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bpReadings, setBpReadings] = useState([]);
  
  // Risk scores (dummy values for now)
  const [qriskScore, setQriskScore] = useState(null);
  const [cancerScore, setCancerScore] = useState(null);
  const [diabetesScore, setDiabetesScore] = useState(null);
  const [dementiaScore, setDementiaScore] = useState(null);
  const [fraxScore, setFraxScore] = useState(null);
  const [abcd2Score, setAbcd2Score] = useState(null);
  const [orbitScore, setOrbitScore] = useState(null);

  // ----- Data Loading & Risk Calculations -----
  useEffect(() => {
    setShuffledActivities(shuffleArray(activities));

    async function loadRecentData() {
      try {
        // Load BP Logs
        if (db.tables.some((t) => t.name === "bpLogs")) {
          const bpLogs = await db.table("bpLogs").toArray();
          if (bpLogs.length > 0) {
            const sortedLogs = bpLogs.sort(
              (a, b) => new Date(b.date) - new Date(a.date)
            );
            setRecentBPReading(sortedLogs[0]);
            setBpReadings(sortedLogs);
            setHasHighBP(sortedLogs[0].systolic > 130 || sortedLogs[0].diastolic > 85);
          }
        }
        // Load Cognitive/Mood Entries
        if (db.tables.some((t) => t.name === "cognitiveEntries")) {
          const entries = await db.table("cognitiveEntries").toArray();
          if (entries.length > 0) {
            const sortedEntries = entries.sort(
              (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
            );
            setRecentMoodEntry(sortedEntries[0]);
            const lowMoodKeywords = ["sad", "depressed", "anxious", "tired", "stressed", "worried"];
            const hasLowMoodContent =
              sortedEntries[0].content &&
              lowMoodKeywords.some((kw) =>
                sortedEntries[0].content.toLowerCase().includes(kw)
              );
            const hasLowMoodTags =
              sortedEntries[0].tags &&
              sortedEntries[0].tags.some((tag) =>
                tag.toLowerCase().includes("emotion") ||
                tag.toLowerCase().includes("processing")
              );
            setHasLowMood(hasLowMoodContent || hasLowMoodTags);
          }
        }
        // Load Medications
        if (db.tables.some((t) => t.name === "medications")) {
          const meds = await db.table("medications").toArray();
          setMedications(meds);
        }
        // Dummy user profile (replace with real data)
        const userProfile = {
          age: 55,
          cholesterol: 200,
          gender: "male",
          bmi: 26,
          weight: 80, // kg
          height: 175, // cm
          bp: 140, // systolic for ABCD²
          clinical: 2, // dummy score
          duration: 30, // in minutes
          diabetes: 1, // yes=1, no=0
          hemoglobin: 12,
          renal: 55,
        };

        // Calculate risk scores
        setQriskScore(calculateQRisk(userProfile.age, userProfile.cholesterol));
        setCancerScore(calculateCancerRisk(userProfile.age, userProfile.gender));
        setDiabetesScore(calculateDiabetesRisk(userProfile.age, userProfile.bmi));
        setDementiaScore(calculateDementiaRisk(userProfile.age));
        setFraxScore(calculateFRAX(userProfile.age, userProfile.weight, userProfile.height));
        setAbcd2Score(
          calculateABCD2(
            userProfile.age,
            userProfile.bp,
            userProfile.clinical,
            userProfile.duration,
            userProfile.diabetes
          )
        );
        setOrbitScore(calculateORBIT(userProfile.age, userProfile.hemoglobin, userProfile.renal));
      } catch (error) {
        console.error("Error loading recent data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadRecentData();
  }, []);

  // ----- Helper Functions for UI -----
  const getRecommendedActivities = () => {
    let recommended = [];
    if (hasHighBP && hasLowMood) {
      recommended = activities.filter((a) => a.forHighBP && a.forLowMood);
    } else if (hasHighBP) {
      recommended = activities.filter((a) => a.forHighBP);
    } else if (hasLowMood) {
      recommended = activities.filter((a) => a.forLowMood);
    } else {
      return shuffledActivities.slice(0, 3);
    }
    return shuffleArray(recommended).slice(0, 3);
  };

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

  const handleTimeShift = (direction) => {
    const newDate = new Date(currentDate);
    if (viewType === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === "forward" ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === "forward" ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  const getVisibleData = () => {
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    if (viewType === "month") {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0);
    } else {
      start.setDate(start.getDate() - 7);
    }
    return bpReadings
      .filter((reading) => {
        const readingDate = new Date(reading.date);
        return readingDate >= start && readingDate <= end;
      })
      .map((reading) => ({
        date: new Date(reading.date).toLocaleDateString(),
        systolic: Number(reading.systolic),
        diastolic: Number(reading.diastolic),
        pulse: Number(reading.pulse || 0),
        id: reading.id,
      }));
  };

  const getMedicationPosition = (medication) => {
    if (!medication.startDate) return { start: 0, end: 100 };
    const start = new Date(currentDate);
    const end = new Date(currentDate);
    if (viewType === "month") {
      start.setDate(1);
      end.setMonth(end.getMonth() + 1, 0);
    } else {
      start.setDate(start.getDate() - 7);
    }
    const medStart = new Date(medication.startDate);
    const medEnd = medication.endDate ? new Date(medication.endDate) : new Date();
    const totalDays = (end - start) / (1000 * 60 * 60 * 24);
    const startOffset = Math.max(0, (medStart - start) / (1000 * 60 * 60 * 24));
    const endOffset = Math.min(totalDays, (medEnd - start) / (1000 * 60 * 60 * 24));
    return {
      start: (startOffset / totalDays) * 100,
      end: (endOffset / totalDays) * 100,
    };
  };

  // Prepare data for rendering
  const recommendedActivities = getRecommendedActivities();
  const chartData = getVisibleData();

  // ----- Render Component -----
  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section">
        <h1>Welcome to EasyGP</h1>
        <p className="subtitle">
          Your privacy-first health tool for symptom logging, intelligent diagnostics, and OTC treatment guidance.
        </p>
      </div>

      {/* Risk Summary Section */}
      <div className="welcome-section">
        <h2>Risk Summary</h2>
        <div className="risk-summary">
          {qriskScore !== null && (
            <div className="risk-card">
              <strong>QRisk:</strong> {qriskScore}%
            </div>
          )}
          {cancerScore !== null && (
            <div className="risk-card">
              <strong>Cancer Risk:</strong> {cancerScore}%
            </div>
          )}
          {diabetesScore !== null && (
            <div className="risk-card">
              <strong>Diabetes Risk:</strong> {diabetesScore}%
            </div>
          )}
          {dementiaScore !== null && (
            <div className="risk-card">
              <strong>Dementia Risk:</strong> {dementiaScore}%
            </div>
          )}
          {fraxScore !== null && (
            <div className="risk-card">
              <strong>FRAX:</strong> {fraxScore}%
            </div>
          )}
          {abcd2Score !== null && (
            <div className="risk-card">
              <strong>ABCD²:</strong> {abcd2Score}
            </div>
          )}
          {orbitScore !== null && (
            <div className="risk-card">
              <strong>ORBIT:</strong> {orbitScore}
            </div>
          )}
        </div>
      </div>

      {/* BP Chart & Risk Scores Side-by-Side */}
      {bpReadings.length > 0 && (
        <div className="welcome-section flex-container">
          <div className="chart-wrapper">
            <div className="time-navigation">
              <button className="nav-btn" onClick={() => handleTimeShift("backward")}>
                <ChevronLeft className="icon" />
              </button>
              <div className="date-select">
                <span className="date-range">{getDateRange()}</span>
                <select value={viewType} onChange={(e) => setViewType(e.target.value)}>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
              </div>
              <button className="nav-btn" onClick={() => handleTimeShift("forward")}>
                <ChevronRight className="icon" />
              </button>
            </div>
            <div className="graph-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255,255,255,0.1)",
                      border: "none",
                      borderRadius: "8px",
                      backdropFilter: "blur(10px)",
                    }}
                    labelStyle={{ color: "white" }}
                    itemStyle={{ color: "white" }}
                  />
                  <ReferenceLine y={120} stroke="rgba(52,211,153,0.3)" strokeDasharray="3 3" />
                  <ReferenceLine y={130} stroke="rgba(251,191,36,0.3)" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="pulse" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <div className="medication-timeline">
                {medications.map((med, index) => {
                  const position = getMedicationPosition(med);
                  return (
                    <div
                      key={med.id}
                      className="medication-block"
                      style={{
                        left: `${position.start}%`,
                        width: `${position.end - position.start}%`,
                        bottom: `${index * 8}px`,
                        backgroundColor: `hsl(${index * 60}, 70%, 50%)`,
                      }}
                      title={`${med.name} ${med.dosage}`}
                    >
                      <span className="medication-label">{med.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="risk-side">
            <h2>Risk Scores</h2>
            <div className="risk-summary">
              {qriskScore !== null && (
                <div className="risk-card">
                  <strong>QRisk:</strong> {qriskScore}%
                </div>
              )}
              {cancerScore !== null && (
                <div className="risk-card">
                  <strong>Cancer Risk:</strong> {cancerScore}%
                </div>
              )}
              {diabetesScore !== null && (
                <div className="risk-card">
                  <strong>Diabetes Risk:</strong> {diabetesScore}%
                </div>
              )}
              {dementiaScore !== null && (
                <div className="risk-card">
                  <strong>Dementia Risk:</strong> {dementiaScore}%
                </div>
              )}
              {fraxScore !== null && (
                <div className="risk-card">
                  <strong>FRAX:</strong> {fraxScore}%
                </div>
              )}
              {abcd2Score !== null && (
                <div className="risk-card">
                  <strong>ABCD²:</strong> {abcd2Score}
                </div>
              )}
              {orbitScore !== null && (
                <div className="risk-card">
                  <strong>ORBIT:</strong> {orbitScore}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Health Summary */}
      {(recentBPReading || recentMoodEntry) && (
        <div className="welcome-section">
          <h2 className="section-title">Your Health Summary</h2>
          <div className="summary-grid">
            {recentBPReading && (
              <div className="summary-card">
                <div className="summary-header">
                  <Heart className="summary-icon" />
                  <h3>Recent Blood Pressure</h3>
                </div>
                <p className="summary-value">
                  {recentBPReading.systolic}/{recentBPReading.diastolic} mmHg
                </p>
                <p className="summary-date">
                  Recorded on {new Date(recentBPReading.date).toLocaleDateString()}
                </p>
                <div className="summary-status">
                  {hasHighBP ? (
                    <span className="status elevated">
                      <ThumbsDown className="status-icon" /> Elevated
                    </span>
                  ) : (
                    <span className="status normal">
                      <ThumbsUp className="status-icon" /> Normal
                    </span>
                  )}
                </div>
              </div>
            )}
            {recentMoodEntry && (
              <div className="summary-card">
                <div className="summary-header">
                  <Brain className="summary-icon" />
                  <h3>Recent Mood Entry</h3>
                </div>
                <p className="summary-text">
                  {recentMoodEntry.content ||
                    (recentMoodEntry.structuredData
                      ? `${recentMoodEntry.structuredData.subject} ${recentMoodEntry.structuredData.verb} ${recentMoodEntry.structuredData.object}`
                      : "No content")}
                </p>
                <p className="summary-date">
                  Recorded on {new Date(recentMoodEntry.timestamp).toLocaleDateString()}
                </p>
                <div className="summary-status">
                  {hasLowMood ? (
                    <span className="status low">
                      <Frown className="status-icon" /> Could use a boost
                    </span>
                  ) : (
                    <span className="status high">
                      <Smile className="status-icon" /> Positive
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
        <div className="welcome-section">
          <h2 className="section-title">
            {hasHighBP && hasLowMood
              ? "Recommended for Your Blood Pressure & Mood"
              : hasHighBP
              ? "Recommended for Your Blood Pressure"
              : hasLowMood
              ? "Recommended for Your Mood"
              : "Activities You Might Enjoy"}
          </h2>
          <div className="activities-grid">
            {recommendedActivities.map((activity) => (
              <div key={activity.id} className="activity-card">
                <h3>{activity.name}</h3>
                <p className="activity-duration">{activity.duration} minutes</p>
                <p className="activity-description">{activity.description}</p>
                <div className="benefits-list">
                  {activity.benefits.slice(0, 2).map((benefit, index) => (
                    <span key={index} className="benefit-item">{benefit}</span>
                  ))}
                </div>
                {activity.forHighBP && hasHighBP && (
                  <div className="activity-tag">
                    <span>Good for blood pressure</span>
                  </div>
                )}
                {activity.forLowMood && hasLowMood && (
                  <div className="activity-tag">
                    <span>Mood enhancing</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Features Grid */}
      <div className="features-grid">
        <div className="feature-card">
          <div className="card-icon">
            <Shield size={32} />
          </div>
          <h2>Ethical Guidance & Security</h2>
          <p>
            We ensure your data remains private with no tracking, while providing ethical and secure health management.
          </p>
        </div>
        <div className="feature-card">
          <div className="card-icon">
            <Stethoscope size={32} />
          </div>
          <h2>Symptom Logging & Analysis</h2>
          <p>Log your symptoms easily and receive intelligent analysis for better self-monitoring.</p>
        </div>
        <div className="feature-card">
          <div className="card-icon">
            <Lock size={32} />
          </div>
          <h2>Data Privacy & Security</h2>
          <p>Your health data stays with you – secure, offline, and completely private.</p>
        </div>
        <div className="feature-card">
          <div className="card-icon">
            <OTCIcon size={32} />
          </div>
          <h2>OTC Guide</h2>
          <p>
            Discover over‑the‑counter treatment options with detailed advice and QR code generation to share with your pharmacist.
          </p>
        </div>
        <div className="feature-card">
          <div className="card-icon">
            <StrepIcon size={32} />
          </div>
          <h2>Strep Tool</h2>
          <p>Manage your symptom logs, import/export your data, and get recommendations for testing, tracking, or treatment.</p>
        </div>
        <div className="feature-card">
          <div className="card-icon">
            <BookIcon size={32} />
          </div>
          <h2>Book Now</h2>
          <p>Soon you'll be able to request tests, prescriptions, or further consultations directly from the app.</p>
        </div>
        <div className="feature-card">
          <div className="card-icon">
            <Info size={32} />
          </div>
          <h2>What's New?</h2>
          <p>
            Explore our updated navigation bar featuring separate installation options: Windows/Android via the install button and iOS installation instructions.
          </p>
        </div>
      </div>
    </div>
  );
}
