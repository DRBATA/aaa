// src/pages/BookNow.jsx
import React, { useState, useEffect } from "react";

export default function BookNow() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [extraField, setExtraField] = useState(""); // Honeypot field
  const [message, setMessage] = useState("");
  const [formLoadTime, setFormLoadTime] = useState(Date.now());

  useEffect(() => {
    setFormLoadTime(Date.now());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Honeypot check: should remain empty
    if (extraField) {
      setMessage("Spam detected.");
      return;
    }

    // Time delay check: if too quick, likely a bot
    const elapsedTime = Date.now() - formLoadTime;
    if (elapsedTime < 2000) {
      setMessage("Please take a moment to fill out the form.");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("Success! Please await a payment link on your phone.");
        setName("");
        setEmail("");
        setPassword("");
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
      <div className="hero-section text-center p-6">
        <h1 className="text-3xl font-bold mb-2">Secure Your Spot Today</h1>
        <p className="subtitle text-gray-600">
          Register now to receive a confirmation email. Once confirmed, you'll be sent a payment link to complete your booking. After payment, you'll gain access to in-depth examination guides, expert tips, and our comprehensive treatment guide.
        </p>
      </div>

      <div className="features-grid px-6 py-4">
        <div className="feature-card bg-white shadow-md p-4 rounded-md mb-6">
          <h2 className="text-xl font-semibold mb-2">Affordable Testing Packages</h2>
          <p className="mb-2">
            • Swab Test: <strong>£19.99</strong><br />
            • CRP Test: <strong>£19.99</strong>
          </p>
          <p>
            Baseline testing for strep and CRP is essential for diagnosing recurring or unclear symptoms. This guide, curated by a doctor with 20 years of experience, is designed to reduce unnecessary tests and bridge gaps in care.
          </p>
        </div>

        <div className="feature-card bg-white shadow-md p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Ready to Get Started?</h2>
          <p className="mb-4">
            Register now by entering your details. Once you register, you'll receive an email notification (to our admin) so that we can send you a payment link to complete your booking. Once payment is confirmed, you'll be able to log in and access exclusive content.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
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
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {/* Honeypot Field */}
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
