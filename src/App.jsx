// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import OTCGuide from "./pages/OTCGuide";
import StrepTool from "./pages/StrepTool";
import BookNow from "./pages/BookNow";
import Navbar from "./components/Navbar";
import "./App.css";

export default function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main className="content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/otc-guide" element={<OTCGuide />} />
            <Route path="/strep-tool" element={<StrepTool />} />
            <Route path="/book-now" element={<BookNow />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
