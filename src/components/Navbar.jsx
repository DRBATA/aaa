import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  Home,
  ClipboardList,
  PenToolIcon as Tool,
  Book,
  Smartphone,
  Grid2x2,
  Apple,
} from "lucide-react";
import phiLogo from "/src/assets/phi-logo.png";

export default function Navbar() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installText, setInstallText] = useState("Install");

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallText("Install");
    };

    const handleControllerChange = () => {
      setInstallText("Update");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    navigator.serviceWorker?.addEventListener("controllerchange", handleControllerChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      navigator.serviceWorker?.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  const handleInstallClick = () => {
    if (installText === "Update") {
      window.location.reload();
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === "accepted") {
          console.log("User installed the app");
        }
        setDeferredPrompt(null);
      });
    }
  };

  const handleIOSInstallClick = () => {
    alert(
      "To install this app on your iOS device:\n\n1. Open Safari.\n2. Tap the Share icon.\n3. Select 'Add to Home Screen'."
    );
  };

  return (
    <nav className="navbar">
      {/* Logo Section */}
      <div className="logo-section">
        <img src={phiLogo} alt="EasyGP Logo" className="nav-logo" />
      </div>

      {/* Updated Main Navigation Links */}
      <div className="nav-links">
        <Link to="/" className="nav-link">
          <Home className="icon" size={18} aria-hidden="true" />
          <span>Home</span>
        </Link>
        <Link to="/otc-guide" className="nav-link">
          <Book className="icon" size={18} aria-hidden="true" />
          <span>OTC Guide</span>
        </Link>
        {/* If you want, you can update the link text to reflect the unified calculator */}
        <Link to="/strep-tool" className="nav-link">
          <ClipboardList className="icon" size={18} aria-hidden="true" />
          <span>Infection Calculator</span>
        </Link>
        <Link to="/book-now" className="nav-link">
          <Tool className="icon" size={18} aria-hidden="true" />
          <span>Book Now</span>
        </Link>
      </div>

      {/* Updated Actions Section */}
      <div className="nav-buttons">
        <button
          className="nav-btn"
          onClick={handleInstallClick}
          aria-label="Install or Update EasyGP"
        >
          <Download className="icon" size={18} aria-hidden="true" />
          <span>{installText}</span>
          <span className="platform-icons" style={{ marginLeft: "0.5rem" }}>
            <Smartphone size={16} aria-hidden="true" style={{ marginRight: "0.25rem" }} />
            <Grid2x2 size={16} aria-hidden="true" />
          </span>
        </button>

        <button
          className="nav-btn"
          onClick={handleIOSInstallClick}
          aria-label="iOS Install Instructions"
        >
          <Apple className="icon" size={18} aria-hidden="true" />
          <span>iOS Install</span>
        </button>
      </div>
    </nav>
  );
}
