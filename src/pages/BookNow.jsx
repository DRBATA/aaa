"use client"

import { useState, useEffect } from "react"
import { db } from "../db"
import { Plus, Trash2, Calendar, Clock, Info } from "lucide-react"

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

  // Medication state
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

  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState(0)
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("profile") // profile, medications

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

        // Load medications
        if (!db.tables.some((t) => t.name === "medications")) {
          db.version(db.verno + 1).stores({
            medications: "++id, name, dosage, frequency, timeToTake, startDate, endDate, sideEffects, notes",
          })
          await db.open()
        }

        const existingMedications = await db.table("medications").toArray()
        setMedications(existingMedications)
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

  // Handle medication form changes
  const handleMedicationChange = (e) => {
    const { name, value } = e.target
    setNewMedication((prev) => ({ ...prev, [name]: value }))
  }

  // Add side effect
  const handleAddSideEffect = () => {
    if (newSideEffect.trim()) {
      setNewMedication((prev) => ({
        ...prev,
        sideEffects: [...prev.sideEffects, newSideEffect.trim()],
      }))
      setNewSideEffect("")
    }
  }

  // Remove side effect
  const handleRemoveSideEffect = (index) => {
    setNewMedication((prev) => {
      const newSideEffects = [...prev.sideEffects]
      newSideEffects.splice(index, 1)
      return { ...prev, sideEffects: newSideEffects }
    })
  }

  // Save medication
  const handleSaveMedication = async () => {
    if (!newMedication.name || !newMedication.dosage) {
      alert("Please enter at least the medication name and dosage")
      return
    }

    try {
      // Add to database
      const id = await db.table("medications").add(newMedication)

      // Update state
      setMedications([...medications, { ...newMedication, id }])

      // Reset form
      setNewMedication({
        name: "",
        dosage: "",
        frequency: "Once daily",
        timeToTake: "Morning",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        sideEffects: [],
        notes: "",
      })

      setShowMedicationForm(false)
    } catch (error) {
      console.error("Error saving medication:", error)
      alert("Error saving medication: " + error.message)
    }
  }

  // Delete medication
  const handleDeleteMedication = async (id) => {
    if (window.confirm("Are you sure you want to delete this medication?")) {
      try {
        await db.table("medications").delete(id)
        setMedications(medications.filter((med) => med.id !== id))
      } catch (error) {
        console.error("Error deleting medication:", error)
        alert("Error deleting medication: " + error.message)
      }
    }
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

  // Render tabs
  const renderTabs = () => {
    return (
      <div className="flex mb-6 border-b border-white/20">
        <button
          className={`px-4 py-2 ${activeTab === "profile" ? "border-b-2 border-white font-bold" : "text-white/70"}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "medications" ? "border-b-2 border-white font-bold" : "text-white/70"}`}
          onClick={() => setActiveTab("medications")}
        >
          Medications
        </button>
      </div>
    )
  }

  // Render medications tab
  const renderMedicationsTab = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Your Medications</h2>
          <button className="glassmorphic-btn" onClick={() => setShowMedicationForm(!showMedicationForm)}>
            {showMedicationForm ? (
              "Cancel"
            ) : (
              <>
                <Plus size={16} className="mr-2" /> Add Medication
              </>
            )}
          </button>
        </div>

        {showMedicationForm && (
          <div className="bg-white/10 p-4 rounded-lg mb-6">
            <h3 className="font-bold mb-4">Add New Medication</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="form-group">
                <label>Medication Name</label>
                <input
                  type="text"
                  name="name"
                  value={newMedication.name}
                  onChange={handleMedicationChange}
                  placeholder="e.g., Lisinopril"
                  className="glassmorphic-select"
                  required
                />
              </div>

              <div className="form-group">
                <label>Dosage</label>
                <input
                  type="text"
                  name="dosage"
                  value={newMedication.dosage}
                  onChange={handleMedicationChange}
                  placeholder="e.g., 10mg"
                  className="glassmorphic-select"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="form-group">
                <label>Frequency</label>
                <select
                  name="frequency"
                  value={newMedication.frequency}
                  onChange={handleMedicationChange}
                  className="glassmorphic-select"
                >
                  <option value="Once daily">Once daily</option>
                  <option value="Twice daily">Twice daily</option>
                  <option value="Three times daily">Three times daily</option>
                  <option value="Four times daily">Four times daily</option>
                  <option value="Every other day">Every other day</option>
                  <option value="Weekly">Weekly</option>
                  <option value="As needed">As needed</option>
                </select>
              </div>

              <div className="form-group">
                <label>Time to Take</label>
                <select
                  name="timeToTake"
                  value={newMedication.timeToTake}
                  onChange={handleMedicationChange}
                  className="glassmorphic-select"
                >
                  <option value="Morning">Morning</option>
                  <option value="Afternoon">Afternoon</option>
                  <option value="Evening">Evening</option>
                  <option value="Bedtime">Bedtime</option>
                  <option value="With meals">With meals</option>
                  <option value="Before meals">Before meals</option>
                  <option value="After meals">After meals</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={newMedication.startDate}
                  onChange={handleMedicationChange}
                  className="glassmorphic-select"
                />
              </div>

              <div className="form-group">
                <label>End Date (if applicable)</label>
                <input
                  type="date"
                  name="endDate"
                  value={newMedication.endDate}
                  onChange={handleMedicationChange}
                  className="glassmorphic-select"
                />
              </div>
            </div>

            <div className="form-group mb-4">
              <label>Side Effects</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newSideEffect}
                  onChange={(e) => setNewSideEffect(e.target.value)}
                  placeholder="Add side effect"
                  className="glassmorphic-select flex-1"
                />
                <button type="button" onClick={handleAddSideEffect} className="glassmorphic-btn">
                  Add
                </button>
              </div>

              {newMedication.sideEffects.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {newMedication.sideEffects.map((effect, index) => (
                    <div key={index} className="bg-white/10 px-3 py-1 rounded-full flex items-center">
                      <span>{effect}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSideEffect(index)}
                        className="ml-2 text-white/70 hover:text-white"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group mb-4">
              <label>Notes</label>
              <textarea
                name="notes"
                value={newMedication.notes}
                onChange={handleMedicationChange}
                placeholder="Any additional notes about this medication"
                className="glassmorphic-select"
              />
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={handleSaveMedication} className="glassmorphic-btn">
                Save Medication
              </button>
            </div>
          </div>
        )}

        {medications.length === 0 ? (
          <div className="text-center p-6 bg-white/5 rounded-lg">
            <p>You haven't added any medications yet.</p>
            <button className="glassmorphic-btn mt-4" onClick={() => setShowMedicationForm(true)}>
              <Plus size={16} className="mr-2" /> Add Your First Medication
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {medications.map((med) => (
              <div key={med.id} className="bg-white/10 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{med.name}</h3>
                    <p className="text-white/70">{med.dosage}</p>
                  </div>
                  <button onClick={() => handleDeleteMedication(med.id)} className="text-white/70 hover:text-white">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2 text-white/70" />
                    <span>{med.frequency}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2 text-white/70" />
                    <span>{med.timeToTake}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-2 text-white/70" />
                    <span>Started: {new Date(med.startDate).toLocaleDateString()}</span>
                  </div>
                  {med.endDate && (
                    <div className="flex items-center mt-1">
                      <Calendar size={16} className="mr-2 text-white/70" />
                      <span>Ended: {new Date(med.endDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {med.sideEffects.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Side Effects:</h4>
                    <div className="flex flex-wrap gap-2">
                      {med.sideEffects.map((effect, index) => (
                        <span key={index} className="bg-white/10 px-3 py-1 rounded-full text-sm">
                          {effect}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {med.notes && (
                  <div className="mt-4">
                    <div className="flex items-start">
                      <Info size={16} className="mr-2 text-white/70 mt-1" />
                      <p className="text-white/90">{med.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
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
      {renderTabs()}

      {activeTab === "profile" ? (
        <>
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
        </>
      ) : (
        renderMedicationsTab()
      )}
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

