"use client"

import { useState } from "react"
import { db } from "../db" // Assuming Dexie is set up
import "../App.css" // Ensure styles are applied
import { Brain, Activity, Droplets, Thermometer, AlertTriangle } from "lucide-react"

const continuousSymptoms = [
  {
    id: "lymphNodesLeft",
    name: "Lymph Node Swelling (Left)",
    min: 0,
    max: 100,
    icon: <Activity className="w-6 h-6" />,
  },
  {
    id: "lymphNodesRight",
    name: "Lymph Node Swelling (Right)",
    min: 0,
    max: 100,
    icon: <Activity className="w-6 h-6" />,
  },
  { id: "tonsilsLeft", name: "Tonsil Swelling (Left)", min: 0, max: 100, icon: <Droplets className="w-6 h-6" /> },
  { id: "tonsilsRight", name: "Tonsil Swelling (Right)", min: 0, max: 100, icon: <Droplets className="w-6 h-6" /> },
  { id: "pusLeft", name: "Pus Coverage (Left)", min: 0, max: 100, icon: <Droplets className="w-6 h-6" /> },
  { id: "pusRight", name: "Pus Coverage (Right)", min: 0, max: 100, icon: <Droplets className="w-6 h-6" /> },
  { id: "fever", name: "Fever (°C)", min: 36, max: 41, icon: <Thermometer className="w-6 h-6" /> },
]

const discreteSymptoms = [
  { id: "blotchyRash", name: "Blotchy Rash" },
  { id: "sandpaperRash", name: "Sandpaper Rash" },
  { id: "sandpaperAfterBlotchy", name: "Sandpaper Rash after Blotchy" },
  { id: "perianalRash", name: "Peri-anal Strep Rash" },
  { id: "soreThroatNoCough", name: "Sore Throat Without Cough" },
  { id: "asymmetricalSwelling", name: "Asymmetrical Swelling" },
  { id: "sneezing", name: "Sneezing" },
  { id: "runnyNose", name: "Runny Nose with Green Discharge" },
  { id: "stickyEyes", name: "Sticky Green Eye Discharge + Conjunctivitis (Both Sides)" },
  { id: "normalMood", name: "Normal Mood & Activity" },
  { id: "mildFever", name: "Mild Fever (Below 38°C)" },
  { id: "gradualOnset", name: "Gradual Onset of Symptoms" },
]

const mentalBehaviorQuestions = [
  { id: "irritability", question: "Is the patient showing increased irritability?" },
  { id: "anxiety", question: "Is the patient experiencing heightened anxiety?" },
  { id: "depression", question: "Are there signs of depression or low mood?" },
  { id: "ocd", question: "Has there been an increase in obsessive or compulsive behaviors?" },
  { id: "tics", question: "Has the patient developed new tics or exacerbation of existing tics?" },
  { id: "adhd", question: "Is there a noticeable increase in ADHD-like symptoms?" },
  { id: "regression", question: "Has there been any regression in age-appropriate behaviors?" },
  { id: "sleep", question: "Are there significant changes in sleep patterns?" },
  { id: "appetite", question: "Has there been a notable change in appetite?" },
  { id: "socialWithdrawal", question: "Is the patient showing signs of social withdrawal?" },
]

const additionalQuestions = [
  { id: "lymphNodesTender", question: "Are the lymph nodes tender?" },
  { id: "tonsileAsymmetry", question: "Is there any tonsil asymmetry?" },
  { id: "feverResponsive", question: "Has the fever been responsive to medication?" },
]

export default function SymptomWizard() {
  const [data, setData] = useState({})
  const [results, setResults] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  const calculateProbabilities = () => {
    let strepProb = 1
    let viralProb = 1

    // Process continuous symptoms
    continuousSymptoms.forEach((symptom) => {
      const value = Number.parseFloat(data[symptom.id]) || 0
      if (symptom.id.includes("lymphNodes")) {
        strepProb *= 1 + Math.pow(value / 100, 2)
        viralProb *= 1 + Math.exp(-0.05 * value)
      } else if (symptom.id.includes("tonsils") || symptom.id.includes("pus")) {
        strepProb *= 1 + Math.pow(value / 100, 2)
      } else if (symptom.id === "fever") {
        strepProb *= 1 + Math.log(value - 36)
        viralProb *= 1 + Math.exp(-(value - 38))
      }
    })

    // Process discrete symptoms
    discreteSymptoms.forEach((symptom) => {
      if (data[symptom.id]) {
        if (
          [
            "blotchyRash",
            "sandpaperRash",
            "sandpaperAfterBlotchy",
            "perianalRash",
            "soreThroatNoCough",
            "asymmetricalSwelling",
          ].includes(symptom.id)
        ) {
          strepProb *= 2
        } else {
          viralProb *= 2
        }
      }
    })

    // Process mental/behavior symptoms
    const mentalBehaviorScore = mentalBehaviorQuestions.filter((q) => data[q.id]).length
    const mentalBehaviorWeight = Math.pow(2, Math.min(mentalBehaviorScore, 4))
    strepProb *= mentalBehaviorWeight

    // Additional question modifiers
    if (data.lymphNodesTender) strepProb *= 1.5
    if (data.tonsileAsymmetry) strepProb *= 2
    if (data.feverResponsive) viralProb *= 1.5
    if (data.feverOnset === "sudden") strepProb *= 1.5

    // Normalize probabilities
    const total = strepProb + viralProb
    return {
      strepLikelihood: strepProb / total,
      viralLikelihood: viralProb / total,
    }
  }

  const getWarnings = () => {
    const warnings = []
    continuousSymptoms.forEach((symptom) => {
      const value = Number.parseFloat(data[symptom.id]) || 0
      if (symptom.id === "fever" && value > 39) {
        warnings.push("High fever detected. Consider immediate medical attention.")
      }
      if ((symptom.id.includes("lymphNodes") || symptom.id.includes("tonsils")) && value > 80) {
        warnings.push(`Severe ${symptom.name} detected. Further evaluation recommended.`)
      }
    })
    return warnings
  }

  const getSuggestions = (strepLikelihood, viralLikelihood) => {
    const suggestions = [
      "Consult with a healthcare professional for a definitive diagnosis.",
      strepLikelihood > viralLikelihood
        ? "Consider a rapid strep test or throat culture."
        : "Focus on symptom management and rest for viral infections.",
      "Monitor symptoms closely and seek medical attention if condition worsens.",
    ]

    if (mentalBehaviorQuestions.some((q) => data[q.id])) {
      suggestions.push("Consider a mental health evaluation due to observed behavioral changes.")
    }

    return suggestions
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const probabilities = calculateProbabilities()
    const warnings = getWarnings()
    const suggestions = getSuggestions(probabilities.strepLikelihood, probabilities.viralLikelihood)

    setResults({
      probabilities,
      warnings,
      suggestions,
    })

    await db.symptomLogs.add({
      date: new Date().toISOString(),
      ...data,
      strepLikelihood: probabilities.strepLikelihood,
      viralLikelihood: probabilities.viralLikelihood,
    })
  }

  return (
    <div className="wizard-container">
      <h2>Comprehensive Symptom Log</h2>
      <form onSubmit={handleSubmit}>
        <h3>Continuous Symptoms</h3>
        {continuousSymptoms.map((symptom) => (
          <div key={symptom.id}>
            <label>
              {symptom.icon}
              {symptom.name}
            </label>
            <input
              type="range"
              name={symptom.id}
              min={symptom.min}
              max={symptom.max}
              value={data[symptom.id] || symptom.min}
              onChange={handleChange}
            />
            <span>
              {data[symptom.id] || symptom.min}
              {symptom.id === "fever" ? "°C" : "%"}
            </span>
          </div>
        ))}

        <h3>Discrete Symptoms</h3>
        {discreteSymptoms.map((symptom) => (
          <div key={symptom.id}>
            <label>
              <input type="checkbox" name={symptom.id} checked={data[symptom.id] || false} onChange={handleChange} />
              {symptom.name}
            </label>
          </div>
        ))}

        <h3>
          <Brain className="w-6 h-6 inline mr-2" />
          Mental and Behavioral Assessment
        </h3>
        {mentalBehaviorQuestions.map((question) => (
          <div key={question.id}>
            <label>
              <input type="checkbox" name={question.id} checked={data[question.id] || false} onChange={handleChange} />
              {question.question}
            </label>
          </div>
        ))}

        <h3>Additional Questions</h3>
        {additionalQuestions.map((question) => (
          <div key={question.id}>
            <label>
              <input type="checkbox" name={question.id} checked={data[question.id] || false} onChange={handleChange} />
              {question.question}
            </label>
          </div>
        ))}

        <div>
          <label>Did fever develop suddenly or gradually?</label>
          <select name="feverOnset" value={data.feverOnset || ""} onChange={handleChange}>
            <option value="">Select...</option>
            <option value="sudden">Sudden</option>
            <option value="gradual">Gradual</option>
          </select>
        </div>

        <button type="submit">Calculate Results</button>
      </form>

      {results && (
        <div className="results-container">
          <h3>Results</h3>
          <div className="probability-container">
            <div className="probability strep">
              <h4>Strep Likelihood:</h4>
              <p>{(results.probabilities.strepLikelihood * 100).toFixed(2)}%</p>
            </div>
            <div className="probability viral">
              <h4>Viral Likelihood:</h4>
              <p>{(results.probabilities.viralLikelihood * 100).toFixed(2)}%</p>
            </div>
          </div>

          <div className="assessment">
            <h4>Assessment:</h4>
            <p>
              {results.probabilities.strepLikelihood > results.probabilities.viralLikelihood
                ? "More likely Strep"
                : "More likely Viral"}
            </p>
          </div>

          {results.warnings.length > 0 && (
            <div className="warnings">
              <h4>
                <AlertTriangle className="inline-block mr-2" />
                Warnings:
              </h4>
              <ul>
                {results.warnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="suggestions">
            <h4>Recommendations:</h4>
            <ul>
              {results.suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

