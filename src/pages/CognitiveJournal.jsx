"use client";

import React, { useState, useEffect } from "react";
import { db } from "../db";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";

const EMOJIS = ["😊", "😢", "😠", "😍", "🤔", "😎", "🙃", "😴", "🥳", "😱", "😡"];

export default function JournalInputAndTagging() {
  const [selectedEmojis, setSelectedEmojis] = useState([]);
  const [thought, setThought] = useState("");
  const [action, setAction] = useState("");
  const [feeling, setFeeling] = useState("");
  const [supporting, setSupporting] = useState("");
  const [contrary, setContrary] = useState("");
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const loadLogs = async () => {
      const logs = await db.table("cognitiveLogs").toArray();
      setLogs(logs.sort((a, b) => new Date(b.date) - new Date(a.date)));
    };
    loadLogs();
  }, []);

  const handleDrop = (emoji) => {
    const existing = selectedEmojis.find((e) => e.emoji === emoji);
    if (existing) {
      const updated = selectedEmojis.map((e) =>
        e.emoji === emoji ? { ...e, intensity: Math.min(e.intensity + 1, 5) } : e
      );
      setSelectedEmojis(updated);
    } else {
      setSelectedEmojis([...selectedEmojis, { emoji, intensity: 1 }]);
    }
  };

  const handleClick = (emoji) => {
    const updated = selectedEmojis.map((e) =>
      e.emoji === emoji ? { ...e, intensity: Math.min(e.intensity + 1, 5) } : e
    );
    setSelectedEmojis(updated);
  };

  const handleSaveEntry = async () => {
    try {
      await db.table("cognitiveLogs").add({
        date: new Date().toISOString(),
        emojis: selectedEmojis,
        thought,
        action,
        feeling,
        supporting,
        contrary
      });
      alert("Entry saved!");
      setSelectedEmojis([]);
      setThought("");
      setAction("");
      setFeeling("");
      setSupporting("");
      setContrary("");
    } catch (error) {
      console.error("Error saving entry:", error);
      alert("Error saving entry.");
    }
  };

  return (
    <div className="journal-wrapper" style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <Card>
        <CardHeader>
          <CardTitle>How are you feeling today?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="emoji-picker" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            {EMOJIS.map((emoji) => (
              <div
                key={emoji}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("emoji", emoji)}
                style={{ fontSize: "2rem", cursor: "grab" }}
              >
                {emoji}
              </div>
            ))}
          </div>

          <div
            className="drop-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const emoji = e.dataTransfer.getData("emoji");
              handleDrop(emoji);
            }}
            style={{
              marginTop: "2rem",
              border: "2px dashed #ccc",
              borderRadius: "12px",
              padding: "1.5rem",
              textAlign: "center",
              minHeight: "100px",
            }}
          >
            {selectedEmojis.length === 0 ? (
              <p>Drag emojis here to express your feelings</p>
            ) : (
              <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                {selectedEmojis.map(({ emoji, intensity }) => (
                  <div
                    key={emoji}
                    onClick={() => handleClick(emoji)}
                    style={{
                      fontSize: `${1.5 + intensity * 0.5}rem`,
                      filter: `drop-shadow(0 0 ${intensity * 4}px rgba(0,0,0,0.3))`,
                      cursor: "pointer",
                    }}
                    title={`Intensity: ${intensity}`}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card style={{ marginTop: "2rem" }}>
        <CardHeader>
          <CardTitle>CBT Reflection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="form-group">
            <label>Thought</label>
            <textarea
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              placeholder="What were you thinking?"
              className="glassmorphic-select"
              style={{ width: "100%", minHeight: "60px" }}
            />
          </div>

          <div className="form-group">
            <label>Action</label>
            <textarea
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="What did you do or plan to do?"
              className="glassmorphic-select"
              style={{ width: "100%", minHeight: "60px" }}
            />
          </div>

          <div className="form-group">
            <label>Feeling</label>
            <textarea
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              placeholder="Describe your emotional state"
              className="glassmorphic-select"
              style={{ width: "100%", minHeight: "60px" }}
            />
          </div>

          <div className="form-group">
            <label>Supporting Evidence</label>
            <textarea
              value={supporting}
              onChange={(e) => setSupporting(e.target.value)}
              placeholder="What supports this thought?"
              className="glassmorphic-select"
              style={{ width: "100%", minHeight: "60px" }}
            />
          </div>

          <div className="form-group">
            <label>Contrary Evidence</label>
            <textarea
              value={contrary}
              onChange={(e) => setContrary(e.target.value)}
              placeholder="What contradicts this thought?"
              className="glassmorphic-select"
              style={{ width: "100%", minHeight: "60px" }}
            />
          </div>

          <Button onClick={handleSaveEntry}>Save Entry</Button>
        </CardContent>
      </Card>
    </div>
  );
}
