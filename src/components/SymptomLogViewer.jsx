import React, { useEffect, useState } from "react";
import { db } from "../db";

export default function SymptomLogViewer() {
  const [symptoms, setSymptoms] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await db.symptomLogs.toArray();
      setSymptoms(data);
    };
    fetchData();
  }, []);

  return (
    <div>
      <h2>Logged Symptoms</h2>
      <ul>
        {symptoms.map((entry) => (
          <li key={entry.id}>
            {entry.date} - Fever: {entry.fever}°C, Tonsil Size: {entry.tonsilSize}mm, Mood: {entry.mood} - 
            OCD: {entry.ocd ? "Yes" : "No"}, Sleep Issues: {entry.sleepIssues ? "Yes" : "No"}
          </li>
        ))}
      </ul>
    </div>
  );
}
