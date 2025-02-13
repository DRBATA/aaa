// src/pages/BookNow.jsx
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
      // Adjust the URL if your backend is hosted elsewhere
      const res = await fetch("http://localhost:5000/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage("Success! Please check your email to verify your signup.");
        setName("");
        setEmail("");
      } else {
        setMessage(data.error || "An error occurred.");
      }
    } catch (error) {
      console.error("Error submitting waitlist form:", error);
      setMessage("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <div className="hero-section text-center p-6">
        <h1 className="text-3xl font-bold mb-2">Book Now</h1>
        <p className="subtitle text-gray-600">
          Experience-Based Strep &amp; PANDAS Care That Transforms Lives
        </p>
      </div>

      {/* Content Sections */}
      <div className="features-grid px-6 py-4">
        <div className="feature-card bg-white shadow-md p-4 rounded-md mb-6">
          <h2 className="text-xl font-semibold mb-2">
            Why Our Approach is Different
          </h2>
          <p className="mb-2">
            Are you worried a hidden strep infection could be triggering your
            child’s anxiety, tics, or behavioral changes? Unlike standard NHS
            pathways that often overlook the strep connection, we use an advanced
            system of Bayesian calculations, in-depth testing, and targeted
            antibiotic regimens to tackle strep-based conditions like PANDAS,
            atypical anorexia, and certain autism-related symptoms.
          </p>
          <p className="mb-2">
            Our protocols are customized for each child, covering medication,
            bone health, and nutritional considerations — all backed by years of
            clinical experience and real-world results. We help your child regain
            focus, reduce anxiety, and restore their true self.
          </p>
          <p>
            Parents report reduced burnout and renewed hope with our holistic,
            proven approach.
          </p>
        </div>

        <div className="feature-card bg-white shadow-md p-4 rounded-md mb-6">
          <h2 className="text-xl font-semibold mb-2">How It Works &amp; Pricing</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              <strong>Initial Consultation (60–90 Minutes) – £249</strong>
              <br />
              Comprehensive assessment, strep testing guidance, and a personalized
              care plan. Includes post-consult summary with recommended steps.
            </li>
            <li>
              <strong>Ongoing Support &amp; Monitoring</strong>
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>
                  <strong>Monthly Subscription – £79/month</strong>
                  <br />
                  Up to 2 follow-up virtual consults (20–30 mins), secure messaging for
                  urgent questions, and regular plan adjustments.
                </li>
                <li>
                  <strong>Pay-Per-Follow-Up – £65 per 20-min consult</strong>
                  <br />
                  Perfect if you prefer occasional check-ins rather than a monthly plan.
                </li>
              </ul>
            </li>
            <li>
              <strong>Achieve Lasting Change</strong>
              <br />
              Watch your child’s tics, anxiety, or eating challenges improve as
              strep/immune triggers are properly addressed.
            </li>
          </ol>
        </div>

        <div className="feature-card bg-white shadow-md p-4 rounded-md mb-6">
          <h2 className="text-xl font-semibold mb-2">Future Features &amp; Waitlist</h2>
          <p className="mb-2">
            We’re developing advanced symptom calculators and a cognitive journaling
            platform to further empower your family. These upcoming tools will help
            you track your child’s progress, understand potential triggers, and
            seamlessly integrate with our medical consultations.
          </p>
          <p>
            <strong>Join our waitlist</strong> to be the first to access these
            features, enjoy exclusive discounts, and help shape our evolving tools.
          </p>
        </div>

        {/* Waitlist Form */}
        <div className="feature-card bg-white shadow-md p-4 rounded-md">
          <h2 className="text-xl font-semibold mb-2">Ready to Begin?</h2>
          <p className="mb-4">
            <strong>Take the first step</strong> by joining our waitlist and secure your
            spot for upcoming features.
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
              Add to Waitlist
            </button>
          </form>
          {message && <p className="mt-4 text-gray-600 text-sm">{message}</p>}
        </div>
      </div>
    </div>
  );
}
