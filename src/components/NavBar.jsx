import React from "react";
import { Link } from "react-router-dom";
import { ImportIcon as FileImport, FileOutputIcon as FileExport, Download, Search, Settings, Home, ClipboardList, LineChart, PenToolIcon as Tool, Book } from "lucide-react";
import phiLogo from "/src/assets/phi-logo.png"; // ✅ Import logo correctly

export default function Navbar() {
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
        
        <button className="nav-btn" aria-label="Install Application">
          <Download className="icon" size={18} aria-hidden="true" />
          <span>Install</span>
        </button>
        
        <button className="nav-btn settings-btn" aria-label="Settings">
          <Settings className="icon" size={18} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
