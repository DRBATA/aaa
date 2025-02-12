// HomePage.jsx
import React from "react";
import {
  Shield,
  Stethoscope,
  Lock,
  FileText,
  Smartphone as OTCIcon,
  ClipboardList as StrepIcon,
  PenToolIcon as BookIcon,
  Info,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to EasyGP</h1>
        <p className="subtitle">
          EasyGP is your privacy-first health tool for symptom logging,
          intelligent diagnostics, and over-the-counter treatment guidance.
          Explore our new features:
        </p>
      </div>

      <div className="features-grid">
        {/* Ethical and Privacy Section */}
        <div className="feature-card">
          <div className="card-icon">
            <Shield size={32} />
          </div>
          <h2>Ethical Guidance & Security</h2>
          <p>
            We ensure your data remains private with no tracking, while providing
            ethical and secure health management.
          </p>
        </div>

        {/* Symptom Logging & Diagnostics Section */}
        <div className="feature-card">
          <div className="card-icon">
            <Stethoscope size={32} />
          </div>
          <h2>Symptom Logging & Analysis</h2>
          <p>
            Log your symptoms easily and receive intelligent analysis for better
            self-monitoring.
          </p>
        </div>

        {/* Data Privacy Section */}
        <div className="feature-card">
          <div className="card-icon">
            <Lock size={32} />
          </div>
          <h2>Data Privacy & Security</h2>
          <p>
            Your health data stays with you – secure, offline, and completely private.
          </p>
        </div>

        {/* OTC Guide Section */}
        <div className="feature-card">
          <div className="card-icon">
            <OTCIcon size={32} />
          </div>
          <h2>OTC Guide</h2>
          <p>
            Discover over‑the‑counter treatment options with detailed advice and
            QR code generation to share with your pharmacist.
          </p>
        </div>

        {/* Strep Tool Section */}
        <div className="feature-card">
          <div className="card-icon">
            <StrepIcon size={32} />
          </div>
          <h2>Strep Tool</h2>
          <p>
            Manage your symptom logs, import/export your data, and get recommendations
            for testing, tracking, or treatment.
          </p>
        </div>

        {/* Book Now Section */}
        <div className="feature-card">
          <div className="card-icon">
            <BookIcon size={32} />
          </div>
          <h2>Book Now</h2>
          <p>
            Soon you’ll be able to request tests, prescriptions, or further consultations
            directly from the app.
          </p>
        </div>

        {/* Info/Additional Section */}
        <div className="feature-card">
          <div className="card-icon">
            <Info size={32} />
          </div>
          <h2>What's New?</h2>
          <p>
            Explore our updated navigation bar featuring separate installation options:
            Windows/Android via the install button and iOS installation instructions.
          </p>
        </div>
      </div>
    </div>
  );
}
