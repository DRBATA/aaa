"use client"

import { useState } from "react"

export default function BookNow() {
  const [pusOnTonsils, setPusOnTonsils] = useState(false)
  const [tenderGlands, setTenderGlands] = useState(false)
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  // Handle the API call when the Check Symptoms button is clicked
  const handleCheckSymptoms = async () => {
    try {
      setLoading(true)
      setResult("")

      console.log("Checking symptoms with API...")
      console.log("Pus on Tonsils:", pusOnTonsils)
      console.log("Tender Glands:", tenderGlands)

      // Call the API with the symptom data
      const response = await fetch("/api/check-symptoms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pusOnTonsils,
          tenderGlands,
        }),
      })

      if (!response.ok) {
        throw new Error(`API returned status: ${response.status}`)
      }

      const data = await response.json()
      setResult(data.recommendation)
      console.log("API response:", data)
    } catch (error) {
      console.error("Error calling symptoms API:", error)
      setResult(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center mb-6">Strep Throat Checker</h1>

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-3 border rounded-md">
          <label htmlFor="pusOnTonsils" className="font-medium">
            Pus on Tonsils
          </label>
          <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
            <input
              type="checkbox"
              id="pusOnTonsils"
              className="absolute w-6 h-6 opacity-0 z-10 cursor-pointer"
              checked={pusOnTonsils}
              onChange={(e) => setPusOnTonsils(e.target.checked)}
            />
            <div
              className={`w-12 h-6 rounded-full transition-colors ${pusOnTonsils ? "bg-green-500" : "bg-gray-300"}`}
            ></div>
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${pusOnTonsils ? "transform translate-x-6" : ""}`}
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 border rounded-md">
          <label htmlFor="tenderGlands" className="font-medium">
            Tender Glands
          </label>
          <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
            <input
              type="checkbox"
              id="tenderGlands"
              className="absolute w-6 h-6 opacity-0 z-10 cursor-pointer"
              checked={tenderGlands}
              onChange={(e) => setTenderGlands(e.target.checked)}
            />
            <div
              className={`w-12 h-6 rounded-full transition-colors ${tenderGlands ? "bg-green-500" : "bg-gray-300"}`}
            ></div>
            <div
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${tenderGlands ? "transform translate-x-6" : ""}`}
            ></div>
          </div>
        </div>
      </div>

      <button
        onClick={handleCheckSymptoms}
        disabled={loading}
        className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {loading ? "Checking..." : "Check Symptoms"}
      </button>

      {result && (
        <div
          className={`mt-6 p-4 rounded-md ${result.includes("Seek Antibiotics") ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}
        >
          <p className="font-medium">{result}</p>
        </div>
      )}
    </div>
  )
}

