// App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SymptomLog from "./pages/SymptomLog";
import Navbar from "./components/Navbar"; // Make sure this path is correct
import "./App.css";

export default function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/symptom-log" element={<SymptomLog />} />

          </Routes>
        </main>
      </div>
    </Router>
  );
}