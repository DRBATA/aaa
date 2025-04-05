import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import OTCGuide from "./pages/OTCGuide"
import UnifiedInfectionCalculator from "./pages/UnifiedInfectionCalculator"
import BookNow from "./pages/BookNow"
import BPTracker from "./pages/BPTracker"
import CognitiveJournal from "./pages/CognitiveJournal"
import Navbar from "./components/Navbar"
import "./index.css"

export default function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/otc-guide" element={<OTCGuide />} />
            <Route path="/strep-tool" element={<UnifiedInfectionCalculator />} />
            <Route path="/health-profile" element={<BookNow />} />
            <Route path="/book-now" element={<BookNow />} />
            <Route path="/bp-tracker" element={<BPTracker />} />
            <Route path="/cognitive-journal" element={<CognitiveJournal />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

