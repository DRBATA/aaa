// HomePage.js
import React from "react";
import { Shield, Lock, Stethoscope, AlertCircle, CheckCircle, HelpCircle, FileText, Info } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to EasyGP</h1>
        <p className="subtitle">
          A privacy-first health journaling and diagnostic tool, designed for security, compliance, and seamless offline use.
        </p>
      </div>

      <div className="features-grid">
        <div className="feature-card ethical-guidelines">
          <div className="card-icon">
            <Shield size={32} />
          </div>
          <h2>EasyGP: Ethical Principles & User Guidance</h2>
          <p>
            At EasyGP, we believe that healthcare technology should empower users, protect privacy, and support collaboration with healthcare professionals.
          </p>
        </div>

        <div className="feature-card">
          <div className="card-icon">
            <Stethoscope size={32} />
          </div>
          <h2>Your Health, Your Control</h2>
          <ul className="feature-list">
            <li><CheckCircle size={16} /> EasyGP is a self-management tool</li>
            <li><AlertCircle size={16} /> We do not diagnose or prescribe</li>
            <li><HelpCircle size={16} /> Tools for self-monitoring and decision support</li>
          </ul>
        </div>

        <div className="feature-card">
          <div className="card-icon">
            <Lock size={32} />
          </div>
          <h2>Data Privacy & Security</h2>
          <ul className="feature-list">
            <li><CheckCircle size={16} /> No tracking, no ads, no third-party data sharing</li>
            <li><CheckCircle size={16} /> Your data stays with you</li>
            <li><CheckCircle size={16} /> No cookies or behavioral tracking</li>
          </ul>
        </div>

        <div className="feature-card">
          <div className="card-icon">
            <FileText size={32} />
          </div>
          <h2>OTC Advice & Strep Testing AI</h2>
          <ul className="feature-list">
            <li><CheckCircle size={16} /> Focus on OTC medication guidance</li>
            <li><CheckCircle size={16} /> AI-powered strep testing triage</li>
            <li><AlertCircle size={16} /> No prescriptions or private consultations</li>
            <li><HelpCircle size={16} /> CQC Compliance (Coming Soon)</li>
          </ul>
        </div>

        <div className="feature-card">
          <div className="card-icon">
            <Info size={32} />
          </div>
          <h2>Future Compliance & Expansion</h2>
          <p>
            As we move toward CQC certification, we will expand to offer more comprehensive services under strict medical regulations.
          </p>
          <p className="disclaimer">
            Users should always consult a healthcare professional for diagnosis, prescriptions, and ongoing care.
          </p>
        </div>
      </div>
    </div>
  );
}