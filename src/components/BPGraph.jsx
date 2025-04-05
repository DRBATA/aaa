"use client"

import { useState, useEffect } from "react"
import { db } from "../db"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"

export default function BPGraph({ viewType = "month", height = 300 }) {
  const [bpReadings, setBpReadings] = useState([])
  const [medications, setMedications] = useState([])
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    async function loadData() {
      try {
        const readings = await db.table("bpLogs").toArray()
        const meds = db.tables.some((t) => t.name === "medications")
          ? await db.table("medications").toArray()
          : []
        setBpReadings(readings.sort((a, b) => new Date(a.date) - new Date(b.date)))
        setMedications(meds)
      } catch (error) {
        console.error("Error loading BP graph data:", error)
      }
    }
    loadData()
  }, [])

  const getDateRange = () => {
    const start = new Date(currentDate)
    const end = new Date(currentDate)

    if (viewType === "month") {
      start.setDate(1)
      end.setMonth(end.getMonth() + 1, 0)
    } else {
      start.setDate(start.getDate() - 7)
    }

    return { start, end }
  }

  const { start, end } = getDateRange()

  const chartData = bpReadings
    .filter((reading) => {
      const readingDate = new Date(reading.date)
      return readingDate >= start && readingDate <= end
    })
    .map((reading) => ({
      date: new Date(reading.date).toLocaleDateString(),
      systolic: Number(reading.systolic),
      diastolic: Number(reading.diastolic),
      pulse: Number(reading.pulse || 0),
    }))

  const getMedicationBands = () => {
    const totalDays = (end - start) / (1000 * 60 * 60 * 24)
    return medications.map((med, index) => {
      const medStart = new Date(med.startDate)
      const medEnd = med.endDate ? new Date(med.endDate) : new Date()
      const startOffset = Math.max(0, (medStart - start) / (1000 * 60 * 60 * 24))
      const endOffset = Math.min(totalDays, (medEnd - start) / (1000 * 60 * 60 * 24))
      return {
        name: med.name,
        left: (startOffset / totalDays) * 100,
        width: ((endOffset - startOffset) / totalDays) * 100,
        color: `hsl(${index * 60}, 70%, 50%)`,
      }
    })
  }

  return (
    <div style={{ position: "relative", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.5)" />
          <YAxis stroke="rgba(255, 255, 255, 0.5)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              border: "none",
              borderRadius: "8px",
              backdropFilter: "blur(10px)",
            }}
            labelStyle={{ color: "white" }}
            itemStyle={{ color: "white" }}
          />
          <ReferenceLine y={130} stroke="rgba(251, 191, 36, 0.4)" strokeDasharray="3 3" />
          <ReferenceLine y={120} stroke="rgba(52, 211, 153, 0.4)" strokeDasharray="3 3" />
          <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="pulse" stroke="#10b981" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>

      {getMedicationBands().map((band, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            bottom: 0,
            height: "8px",
            left: `${band.left}%`,
            width: `${band.width}%`,
            backgroundColor: band.color,
            opacity: 0.6,
            borderRadius: "2px",
          }}
          title={band.name}
        />
      ))}
    </div>
  )
}
