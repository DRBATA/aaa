"use client";

import React, { useState, useEffect } from "react";
import { db } from "../db";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import BPTracker from "../components/BPTracker";

export default function HomePage() {
  const [logs, setLogs] = useState([]);
  const [bpLogs, setBpLogs] = useState([]);
  const [medications, setMedications] = useState([]);
  const [hasHighBP, setHasHighBP] = useState(false);
  const [hasLowMood, setHasLowMood] = useState(false);
  const [qriskScore, setQriskScore] = useState(null);
  const [cancerScore, setCancerScore] = useState(null);
  const [dementiaScore, setDementiaScore] = useState(null);
  const [diabetesScore, setDiabetesScore] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const cognitive = await db.table("cognitiveLogs").toArray();
      const sortedCog = cognitive.sort((a, b) => new Date(a.date) - new Date(b.date));
      setLogs(sortedCog);

      const bp = await db.table("bpLogs").toArray();
      const sortedBp = bp.sort((a, b) => new Date(a.date) - new Date(b.date));
      setBpLogs(sortedBp);

      if (sortedBp.length > 0) {
        const latest = sortedBp[sortedBp.length - 1];
        setHasHighBP(latest.systolic > 130 || latest.diastolic > 85);
      }

      const meds = await db.table("medications").toArray();
      setMedications(meds);

      if (cognitive.length > 0) {
        const recent = cognitive[cognitive.length - 1];
        const lowMoodKeywords = ["sad", "tired", "anxious", "worried", "depressed"];
        const content = recent.notes?.toLowerCase() || "";
        setHasLowMood(lowMoodKeywords.some((word) => content.includes(word)));
      }

      const profile = { age: 55, cholesterol: 200, gender: "male", bmi: 26 };
      setQriskScore(Math.min(profile.age * 0.5 + profile.cholesterol * 0.2, 100));
      setCancerScore(Math.min(profile.age * (profile.gender === "male" ? 0.3 : 0.25), 100));
      setDementiaScore(Math.min(profile.age * 0.7, 100));
      setDiabetesScore(Math.min(profile.age * 0.4 + profile.bmi * 0.6, 100));
    };
    fetchData();
  }, []);

  const flattened = logs.flatMap((log) => {
    return log.emojis.map((e) => ({
      date: new Date(log.date).toLocaleDateString(),
      emoji: e.emoji,
      intensity: e.intensity,
    }));
  });

  const emojiSet = Array.from(new Set(flattened.map((item) => item.emoji)));

  const chartData = Array.from(
    flattened.reduce((acc, item) => {
      if (!acc.has(item.date)) acc.set(item.date, { date: item.date });
      acc.get(item.date)[item.emoji] = item.intensity;
      return acc;
    }, new Map()).values()
  );

  return (
    <div className="home-dashboard" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <BPTracker />
        </div>
        <div style={{ flex: 1, minWidth: "300px" }}>
          <Card>
            <CardHeader>
              <CardTitle>Emotional Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <p>No cognitive data yet. Entries with emoji tags will appear here.</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    {emojiSet.map((emoji, idx) => (
                      <Line
                        key={emoji}
                        type="monotone"
                        dataKey={emoji}
                        stroke={`hsl(${(idx * 50) % 360}, 70%, 50%)`}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {bpLogs.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <Card>
            <CardHeader>
              <CardTitle>Blood Pressure History</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart
                  data={bpLogs.map((bp) => ({
                    date: new Date(bp.date).toLocaleDateString(),
                    systolic: bp.systolic,
                    diastolic: bp.diastolic,
                    pulse: bp.pulse || 0,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <ReferenceLine y={120} stroke="green" strokeDasharray="3 3" />
                  <ReferenceLine y={140} stroke="red" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="pulse" stroke="#10b981" strokeWidth={1} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {medications.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <Card>
            <CardHeader>
              <CardTitle>Current Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {medications.map((med) => (
                  <li key={med.id}>
                    {med.name} {med.dosage} — started {new Date(med.startDate).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      <div style={{ marginTop: "3rem" }}>
        <Card>
          <CardHeader>
            <CardTitle>Suggested Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              <li>Mood Journal</li>
              <li>Breathing Techniques</li>
              <li>CBT Thought Tracker</li>
              <li>Sleep Log</li>
              {hasHighBP && <li>Relaxation for BP</li>}
              {hasLowMood && <li>Reflection Prompts</li>}
              {qriskScore && <li>QRisk: {qriskScore.toFixed(1)}%</li>}
              {cancerScore && <li>Cancer Risk: {cancerScore.toFixed(1)}%</li>}
              {dementiaScore && <li>Dementia Risk: {dementiaScore.toFixed(1)}%</li>}
              {diabetesScore && <li>Diabetes Risk: {diabetesScore.toFixed(1)}%</li>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
