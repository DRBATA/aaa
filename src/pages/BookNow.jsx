import React, { useState, useEffect } from "react";

export default function BookNow() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [extraField, setExtraField] = useState(""); // Honeypot field
  const [message, setMessage] = useState("");
  const [formLoadTime, setFormLoadTime] = useState(Date.now());

  useEffect(() => {
    setFormLoadTime(Date.now());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot check: this field should remain empty
    if (extraField) {
      setMessage("Spam detected.");
      return;
    }

    // Time delay check: if submitted too quickly, it's likely a bot
    const elapsedTime = Date.now() - formLoadTime;
    if (elapsedTime < 2000) {
      setMessage("Please take a moment to fill out the form.");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("Success! Please check your email to confirm your signup. Once confirmed, you'll receive a payment link for your tests.");
        setName("");
        setEmail("");
      } else {
        setMessage(data.error || "An error occurred.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section text-center p-6">
        <h1 className="text-3xl font-bold mb-2">Book Your Testing Session</h1>
        <p className="subtitle text-gray-600">
          Ultimate Strep &amp; PANDAS Testing &amp; Guide Curated by a Doctor with 20 Years’ Experience
        </p>
      </div>

      <div className="features-grid px-6 py-4">
        {/* Pricing and Value Proposition */}
        <div className="feature-card bg-white shadow-md p-4 rounded-md mb-6">
          <h2 className="text-xl font-semibold mb-2">Transparent & Affordable Testing</h2>
          <p className="mb-2">
            Each testing session includes:
            <br />
            • A Swab Test at <strong>£19.99</strong>
            <br />
            • A CRP Test at <strong>£19.99</strong>
          </p>
          <p className="mb-2">
            Baseline testing for strep and CRP provides vital information on whether a strep infection is present or if household contacts should be tested. This is especially useful in cases of recurrent symptoms, unclear diagnoses (e.g., new ADHD, regression, or developmental issues), and ensuring children don’t fall through the gaps.
          </p>
          <p>
            Our approach is curated by a doctor with nearly 20 years of experience—designed to reduce unnecessary testing and provide clear, expert guidance on managing strep-related conditions.
          </p>
        </div>

        {/* Waitlist / Registration Form */}
        <div className="feature-card bg-white shadow-md p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Secure Your Spot Today</h2>
          <p className="mb-4">
            Register now to receive a confirmation email. Once confirmed, you'll be sent a payment link to complete your booking. After payment, you can log in to access in-depth examination guides, expert tips, and our comprehensive treatment guide.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {/* Honeypot Field (invisible to users) */}
            <div style={{ display: "none" }}>
              <label htmlFor="extraField">Leave this field blank</label>
              <input
                id="extraField"
                name="extraField"
                type="text"
                value={extraField}
                onChange={(e) => setExtraField(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
            >
              Register for Testing
            </button>
          </form>
          {message && <p className="mt-4 text-gray-600 text-sm">{message}</p>}
        </div>
      </div>
    </div>
  );
}
