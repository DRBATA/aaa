"use client"

import { useState, useEffect } from "react"
import { db } from "../db"
import { Plus, Trash2, Calendar, Clock, Info } from "lucide-react"

export default function HealthProfile() {
  const [profile, setProfile] = useState({
    name: "",
    dateOfBirth: "",
    gender: "",
    height: "",
    weight: "",
    allergies: "",
    chronicConditions: [],
    medications: [],
    familyHistory: [],
    tcHdlRatio: "",
    tcHdlDate: "",
    riskProfile: {
      qrisk: null,
      cancerRisk: null,
      diabetesRisk: null,
      dementiaRisk: null,
      frax: null,
      abcd2: null,
      orbit: null,
    },
  })

  const [medications, setMedications] = useState([])
  const [showMedicationForm, setShowMedicationForm] = useState(false)
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    frequency: "Once daily",
    timeToTake: "Morning",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    sideEffects: [],
    notes: "",
  })
  const [newSideEffect, setNewSideEffect] = useState("")
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    async function loadProfile() {
      try {
        const existingProfile = await db.table("profile").toArray()
        if (existingProfile.length > 0) {
          setProfile(existingProfile[0])
          setIsFirstVisit(false)
          setOnboardingStep(4)
        }
        const existingMedications = await db.table("medications").toArray()
        setMedications(existingMedications)
      } catch (error) {
        console.error("Error loading profile:", error)
      }
    }
    loadProfile()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const saveProfile = async () => {
    setIsSaving(true)
    try {
      const existingProfile = await db.table("profile").toArray()
      if (existingProfile.length > 0) {
        await db.table("profile").update(existingProfile[0].id, profile)
      } else {
        await db.table("profile").add({ ...profile, createdAt: new Date().toISOString() })
      }
      setIsFirstVisit(false)
      setOnboardingStep(4)
      alert("Profile saved successfully!")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Error saving profile: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  function calculateAge(dob) {
    if (!dob) return ""
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  function calculateBMI(height, weight) {
    if (!height || !weight) return "Not calculated"
    const heightInMeters = height / 100
    const bmi = weight / (heightInMeters * heightInMeters)
    return bmi.toFixed(1)
  }

  return (
    <div className="content">
      <div className="health-profile-container">
        {onboardingStep === 4 && (
          <div className="profile-card">
            <div className="profile-header">
              <h3>{profile.name}</h3>
              <p>
                {profile.gender}, {calculateAge(profile.dateOfBirth)} years old
              </p>
            </div>
            <div className="profile-section">
              <h4>Physical</h4>
              <p>Height: {profile.height} cm</p>
              <p>Weight: {profile.weight} kg</p>
              <p>BMI: {calculateBMI(profile.height, profile.weight)}</p>
              {profile.tcHdlRatio && (
                <>
                  <p>TC:HDL Ratio: {profile.tcHdlRatio}</p>
                  <p>Recorded on: {new Date(profile.tcHdlDate).toLocaleDateString()}</p>
                </>
              )}
            </div>
            <div className="profile-section">
              <h4>Medical</h4>
              <p>
                <strong>Allergies:</strong> {profile.allergies || "None listed"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
