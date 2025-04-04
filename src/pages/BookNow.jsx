"use client"

import { useState, useEffect } from "react"
import { db } from "../db"

export default function BookNow() {
  // Basic profile state
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
  })

  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load existing profile on component mount
  useEffect(() => {
    async function loadProfile() {
      try {
        // Check if we have a profile in the database
        const existingProfile = await db.table("profile").toArray()

        if (existingProfile && existingProfile.length > 0) {
          setProfile(existingProfile[0])
          setIsFirstVisit(false)
          setOnboardingStep(4) // Skip onboarding if we already have a profile
        }
      } catch (error) {
        console.error("Error loading profile:", error)
      }
    }

    // Create profile table if it doesn't exist
    if (!db.tables.some((t) => t.name === "profile")) {
      db.version(db.verno + 1).stores({
        profile: "++id",
      })
    }

    loadProfile()
  }, [])

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  // Handle array field changes (medications, conditions, etc.)
  const handleArrayChange = (field, index, value) => {
    setProfile((prev) => {
      const newArray = [...prev[field]]
      newArray[index] = value
      return { ...prev, [field]: newArray }
    })
  }

  // Add new item to an array field
  const handleAddItem = (field) => {
    setProfile((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }))
  }

  // Remove item from an array field
  const handleRemoveItem = (field, index) => {
    setProfile((prev) => {
      const newArray = [...prev[field]]
      newArray.splice(index, 1)
      return { ...prev, [field]: newArray }
    })
  }

  // Save profile to database
  const saveProfile = async () => {
    setIsSaving(true)
    try {
      // Check if we already have a profile
      const existingProfile = await db.table("profile").toArray()

      if (existingProfile && existingProfile.length > 0) {
        // Update existing profile
        await db.table("profile").update(existingProfile[0].id, profile)
      } else {
        // Create new profile
        await db.table("profile").add({
          ...profile,
          createdAt: new Date().toISOString(),
        })
      }

      setIsFirstVisit(false)
      setOnboardingStep(4) // Complete onboarding
      alert("Profile saved successfully!")
    } catch (error) {
      console.error("Error saving profile:", error)
      alert("Error saving profile: " + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Onboarding steps
  const onboardingSteps = [
    // Step 0: Welcome
    <div key={0} className="onboarding-step">
      <h2>Welcome to EasyGP</h2>
      <p>Let's set up your health profile to get personalized recommendations.</p>
      <p>Your data stays on your device for maximum privacy.</p>
      <button onClick={() => setOnboardingStep(1)} className="glassmorphic-btn">
        Get Started
      </button>
    </div>,

    // Step 1: Basic Info
    <div key={1} className="onboarding-step">
      <h2>Basic Information</h2>
      <div className="form-group">
        <label>Name</label>
        <input type="text" name="name" value={profile.name} onChange={handleChange} placeholder="Your name" />
      </div>

      <div className="form-group">
        <label>Date of Birth</label>
        <input type="date" name="dateOfBirth" value={profile.dateOfBirth} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Gender</label>
        <select name="gender" value={profile.gender} onChange={handleChange} className="glassmorphic-select">
          <option value="">Select...</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="form-actions">
        <button onClick={() => setOnboardingStep(0)} className="secondary-button">
          Back
        </button>
        <button
          onClick={() => setOnboardingStep(2)}
          className="glassmorphic-btn"
          disabled={!profile.name || !profile.dateOfBirth || !profile.gender}
        >
          Next
        </button>
      </div>
    </div>,

    // Step 2: Physical Measurements
    <div key={2} className="onboarding-step">
      <h2>Physical Measurements</h2>
      <div className="form-group">
        <label>Height (cm)</label>
        <input type="number" name="height" value={profile.height} onChange={handleChange} placeholder="Height in cm" />
      </div>

      <div className="form-group">
        <label>Weight (kg)</label>
        <input type="number" name="weight" value={profile.weight} onChange={handleChange} placeholder="Weight in kg" />
      </div>

      <div className="form-actions">
        <button onClick={() => setOnboardingStep(1)} className="secondary-button">
          Back
        </button>
        <button onClick={() => setOnboardingStep(3)} className="glassmorphic-btn">
          Next
        </button>
      </div>
    </div>,

    // Step 3: Medical History
    <div key={3} className="onboarding-step">
      <h2>Medical History</h2>

      <div className="form-group">
        <label>Allergies</label>
        <textarea name="allergies" value={profile.allergies} onChange={handleChange} placeholder="List any allergies" />
      </div>

      <div className="form-group">
        <label>Chronic Conditions</label>
        {profile.chronicConditions.map((condition, index) => (
          <div key={index} className="array-input">
            <input
              type="text"
              value={condition}
              onChange={(e) => handleArrayChange("chronicConditions", index, e.target.value)}
              placeholder="Condition name"
            />
            <button
              type="button"
              onClick={() => handleRemoveItem("chronicConditions", index)}
              className="remove-button"
            >
              ✕
            </button>
          </div>
        ))}
        <button type="button" onClick={() => handleAddItem("chronicConditions")} className="add-button">
          + Add Condition
        </button>
      </div>

      <div className="form-group">
        <label>Medications</label>
        {profile.medications.map((medication, index) => (
          <div key={index} className="array-input">
            <input
              type="text"
              value={medication}
              onChange={(e) => handleArrayChange("medications", index, e.target.value)}
              placeholder="Medication name"
            />
            <button type="button" onClick={() => handleRemoveItem("medications", index)} className="remove-button">
              ✕
            </button>
          </div>
        ))}
        <button type="button" onClick={() => handleAddItem("medications")} className="add-button">
          + Add Medication
        </button>
      </div>

      <div className="form-actions">
        <button onClick={() => setOnboardingStep(2)} className="secondary-button">
          Back
        </button>
        <button onClick={saveProfile} className="glassmorphic-btn" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>,

    // Step 4: Profile Complete (Edit Mode)
    <div key={4} className="profile-complete">
      <h2>Health Profile</h2>

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
        </div>

        <div className="profile-section">
          <h4>Medical</h4>
          <p>
            <strong>Allergies:</strong> {profile.allergies || "None listed"}
          </p>

          <strong>Chronic Conditions:</strong>
          {profile.chronicConditions.length > 0 ? (
            <ul>
              {profile.chronicConditions.map((condition, index) => (
                <li key={index}>{condition}</li>
              ))}
            </ul>
          ) : (
            <p>None listed</p>
          )}

          <strong>Medications:</strong>
          {profile.medications.length > 0 ? (
            <ul>
              {profile.medications.map((medication, index) => (
                <li key={index}>{medication}</li>
              ))}
            </ul>
          ) : (
            <p>None listed</p>
          )}
        </div>
      </div>

      <button onClick={() => setOnboardingStep(1)} className="glassmorphic-btn">
        Edit Profile
      </button>
    </div>,
  ]

  // Helper function to calculate age from date of birth
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

  // Helper function to calculate BMI
  function calculateBMI(height, weight) {
    if (!height || !weight) return "Not calculated"
    const heightInMeters = height / 100
    const bmi = weight / (heightInMeters * heightInMeters)
    return bmi.toFixed(1)
  }

  return (
    <div className="content">
      <div className="health-profile-container">{onboardingSteps[onboardingStep]}</div>
    </div>
  )
}

