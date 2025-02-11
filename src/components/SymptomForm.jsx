import React, { useState } from "react";
import { db } from "../db";

export default function SymptomForm() {
  const [symptoms, setSymptoms] = useState({
    fever: "",
    tonsilSize: "",
    pusCoverage: "",
    lymphNodes: "",
    rash: false,
    cough: false,
    sneezing: false,
    mood: "Normal",
    irritability: false,
    ocd: false,
    tics: false,
    regression: false,
    sleepIssues: false,
    appetite: false,
    socialWithdrawal: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSymptoms((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const entry = { date: new Date().toISOString(), ...symptoms };

    await db.symptomLogs.add(entry);
    alert("Symptoms logged!");

    // Next: Process Risk Assessments Automatically
    processRisk(entry);
  };

  return (
    <form onSubmit={handleSubmit} className="symptom-form">
      <h2>Log Symptoms</h2>
      <label>
        Fever (°C):
        <input type="number" name="fever" value={symptoms.fever} onChange={handleChange} />
      </label>
      <label>
        Tonsil Size (mm):
        <input type="number" name="tonsilSize" value={symptoms.tonsilSize} onChange={handleChange} />
      </label>
      <label>
        Pus Coverage (%):
        <input type="number" name="pusCoverage" value={symptoms.pusCoverage} onChange={handleChange} />
      </label>
      <label>
        Lymph Node Swelling (%):
        <input type="number" name="lymphNodes" value={symptoms.lymphNodes} onChange={handleChange} />
      </label>
      <label>
        Rash:
        <input type="checkbox" name="rash" checked={symptoms.rash} onChange={handleChange} />
      </label>
      <label>
        Cough:
        <input type="checkbox" name="cough" checked={symptoms.cough} onChange={handleChange} />
      </label>
      <label>
        Sneezing:
        <input type="checkbox" name="sneezing" checked={symptoms.sneezing} onChange={handleChange} />
      </label>

      {/* 🧠 NEW MOOD SYMPTOMS SECTION */}
      <h3>Mood & Cognitive Symptoms</h3>
      <label>
        Mood:
        <select name="mood" value={symptoms.mood} onChange={handleChange}>
          <option>Normal</option>
          <option>Irritable</option>
          <option>Very Low Mood</option>
        </select>
      </label>
      <label>
        Increased Irritability:
        <input type="checkbox" name="irritability" checked={symptoms.irritability} onChange={handleChange} />
      </label>
      <label>
        New or Worsening OCD:
        <input type="checkbox" name="ocd" checked={symptoms.ocd} onChange={handleChange} />
      </label>
      <label>
        New or Worsening Tics:
        <input type="checkbox" name="tics" checked={symptoms.tics} onChange={handleChange} />
      </label>
      <label>
        Regression in Behavior:
        <input type="checkbox" name="regression" checked={symptoms.regression} onChange={handleChange} />
      </label>
      <label>
        Sleep Disturbance:
        <input type="checkbox" name="sleepIssues" checked={symptoms.sleepIssues} onChange={handleChange} />
      </label>
      <label>
        Appetite Changes:
        <input type="checkbox" name="appetite" checked={symptoms.appetite} onChange={handleChange} />
      </label>
      <label>
        Social Withdrawal:
        <input type="checkbox" name="socialWithdrawal" checked={symptoms.socialWithdrawal} onChange={handleChange} />
      </label>

      <button type="submit">Submit</button>
    </form>
  );
}
