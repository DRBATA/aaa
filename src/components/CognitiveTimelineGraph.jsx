"use client";

import React, { useState, useEffect } from "react";
import { db } from "../db";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function CognitiveTimelineGraph() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await db.table("cognitiveLogs").toArray();
      const sorted = data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setLogs(sorted);
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
    <div className="cognitive-graph-wrapper" style={{ padding: "2rem" }}>
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
                    dot={{ r: 9 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
