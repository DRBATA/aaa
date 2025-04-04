export default function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Get the symptoms from the request body
    const { pusOnTonsils, tenderGlands } = req.body

    console.log("Received symptoms:", { pusOnTonsils, tenderGlands })

    // Determine the recommendation based on the symptoms
    let recommendation

    if (pusOnTonsils && tenderGlands) {
      recommendation = "Seek Antibiotics: Both pus on tonsils and tender glands detected."
    } else if (pusOnTonsils) {
      recommendation = "Monitor symptoms: Pus on tonsils detected, but no tender glands."
    } else if (tenderGlands) {
      recommendation = "Monitor symptoms: Tender glands detected, but no pus on tonsils."
    } else {
      recommendation = "No treatment needed: No concerning symptoms detected."
    }

    // Return the recommendation
    return res.status(200).json({ recommendation })
  } catch (error) {
    console.error("Error processing symptoms:", error)
    return res.status(500).json({ error: "Internal server error" })
  }
}

