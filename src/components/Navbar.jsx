import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ImportIcon as FileImport,
  FileOutputIcon as FileExport,
  Download,
  Search,
  Settings,
  Home,
  ClipboardList,
  LineChart,
  PenToolIcon as Tool,
  Book,
} from "lucide-react";
import phiLogo from "/src/assets/phi-logo.png"; // ✅ Import logo correctly

export default function Navbar() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installText, setInstallText] = useState("Install");

  // Detect if the device is iOS (iPhone/iPad)
  const isIos = () => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent);
  };

  useEffect(() => {
    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallText("Install");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for service worker updates
    navigator.serviceWorker?.addEventListener("controllerchange", () => {
      setInstallText("Update");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Handle Install or Update Button Click
  const handleInstallClick = () => {
    if (installText === "Update") {
      window.location.reload(); // Refresh to get the latest PWA version
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User installed the app");
        }
        setDeferredPrompt(null);
      });
    } else if (isIos()) {
      alert(
        "To install on iPhone/iPad: Open in Safari, tap 'Share', then 'Add to Home Screen'."
      );
    }
  };

  return (
    <nav className="navbar">
      {/* Logo Section */}
      <div className="logo-section">
        <img src={phiLogo} alt="EasyGP Logo" className="nav-logo" />
      </div>

      {/* Search Section */}
      <div className="search-container" role="search">
        <Search className="search-icon" size={18} aria-hidden="true" />
        <input
          type="search"
          placeholder="Search..."
          className="search-input"
          aria-label="Search application"
        />
      </div>

      {/* Main Navigation */}
      <div className="nav-links">
        <Link to="/" className="nav-link">
          <Home className="icon" size={18} aria-hidden="true" />
          <span>Home</span>
        </Link>
        <Link to="/symptom-log" className="nav-link">
          <ClipboardList className="icon" size={18} aria-hidden="true" />
          <span>Symptom Log</span>
        </Link>
        <Link to="/insights" className="nav-link">
          <LineChart className="icon" size={18} aria-hidden="true" />
          <span>Insights</span>
        </Link>
        <Link to="/tools" className="nav-link">
          <Tool className="icon" size={18} aria-hidden="true" />
          <span>Tools</span>
        </Link>
        <Link to="/guides" className="nav-link">
          <Book className="icon" size={18} aria-hidden="true" />
          <span>Guides</span>
        </Link>
      </div>

      {/* Actions Section */}
      <div className="nav-buttons">
        <button className="nav-btn" aria-label="Import Data">
          <FileImport className="icon" size={18} aria-hidden="true" />
          <span>Import</span>
        </button>

        <button className="nav-btn" aria-label="Export Data">
          <FileExport className="icon" size={18} aria-hidden="true" />
          <span>Export</span>
        </button>

        <button
          className="nav-btn"
          onClick={handleInstallClick}
          aria-label="Install or Update EasyGP"
        >
          <Download className="icon" size={18} aria-hidden="true" />
          <span>{installText}</span>
        </button>

        <button className="nav-btn settings-btn" aria-label="Settings">
          <Settings className="icon" size={18} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
