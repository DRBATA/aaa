"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tag, Heart, Brain, Activity, AlertTriangle, CheckCircle, Ban, X } from "lucide-react";

// Define the available tag types with labels, icons, and color classes.
const TAG_TYPES = {
  action: {
    label: "Action",
    icon: Activity,
    color: "bg-green-100 text-green-800 hover:bg-green-200",
    description: "Something you did or plan to do."
  },
  feeling: {
    label: "Feeling",
    icon: Heart,
    color: "bg-red-100 text-red-800 hover:bg-red-200",
    description: "An emotion or mood."
  },
  thought: {
    label: "Thought",
    icon: Brain,
    color: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    description: "A belief, assumption, or interpretation."
  }
};

export default function JournalInputAndTagging() {
  const [entry, setEntry] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedText, setSelectedText] = useState("");
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [tagMenuPosition, setTagMenuPosition] = useState({ x: 0, y: 0 });
  const textareaRef = useRef(null);

  // For the "Reality Check" modal
  const [activeThoughtTag, setActiveThoughtTag] = useState(null);
  const [realityCheck, setRealityCheck] = useState({
    supporting: [],
    contrary: []
  });

  // Instructions toggle
  const [showInstructions, setShowInstructions] = useState(true);

  // Handle text selection in the textarea
  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (text) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setShowTagMenu(true);
      setTagMenuPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + window.scrollY + 10
      });
    } else {
      setShowTagMenu(false);
    }
  };

  // Add a tag to the selected text
  const addTag = (type) => {
    if (!selectedText) return;
    const startIndex = entry.indexOf(selectedText);
    if (startIndex === -1) return;

    const newTag = {
      id: Date.now(),
      text: selectedText,
      type,
      startIndex,
      endIndex: startIndex + selectedText.length
    };
    setTags([...tags, newTag]);
    setShowTagMenu(false);
    setSelectedText("");

    // If the user tagged a "Thought," open the Reality Check modal
    if (type === "thought") {
      setActiveThoughtTag(newTag);
      setRealityCheck({ supporting: [], contrary: [] });
    }
  };

  // Render the entry with tags highlighted
  const renderEntry = () => {
    if (!entry) return null;

    let elements = [];
    let lastIndex = 0;

    // Sort tags by start index
    const sortedTags = [...tags].sort((a, b) => a.startIndex - b.startIndex);

    sortedTags.forEach((tag, index) => {
      // Add normal text before the tag
      if (tag.startIndex > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>
            {entry.slice(lastIndex, tag.startIndex)}
          </span>
        );
      }

      // Render the tagged text as a badge
      const TagIcon = TAG_TYPES[tag.type].icon;
      elements.push(
        <Badge
          key={tag.id}
          className={`inline-flex items-center gap-1 mx-1 cursor-pointer ${TAG_TYPES[tag.type].color}`}
          onClick={() => {
            // If it's a thought, allow user to re-open the Reality Check
            if (tag.type === "thought") {
              setActiveThoughtTag(tag);
              // In a real app, you might store realityCheck data per tag ID
              setRealityCheck({ supporting: [], contrary: [] });
            }
          }}
          title={TAG_TYPES[tag.type].description}
        >
          <TagIcon className="w-3 h-3" />
          {entry.slice(tag.startIndex, tag.endIndex)}
        </Badge>
      );

      lastIndex = tag.endIndex;
    });

    // Append remaining text
    if (lastIndex < entry.length) {
      elements.push(<span key="text-end">{entry.slice(lastIndex)}</span>);
    }
    return elements;
  };

  // Add evidence to the Reality Check
  const addEvidence = (type) => {
    const item = prompt(`Add ${type} evidence:`);
    if (!item) return;
    setRealityCheck((prev) => ({
      ...prev,
      [type]: [...prev[type], item]
    }));
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      {/* Optional instructions section */}
      {showInstructions && (
        <Card className="bg-blue-50">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>How to Use This Journal</CardTitle>
            <Button
              variant="ghost"
              onClick={() => setShowInstructions(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-700">
            <p>
              1. Write freely in the text box below about your experiences,
              thoughts, or feelings.
            </p>
            <p>
              2. **Highlight** any text you want to analyze or label. A small
              menu will appear allowing you to tag it as an <strong>Action</strong>,
              <strong> Feeling</strong>, or <strong>Thought</strong>.
            </p>
            <p>
              3. If you label something as a Thought, you’ll have the option to
              perform a quick <strong>Reality Check</strong> by adding
              supporting or contrary evidence. This helps you test how accurate
              or balanced the thought might be.
            </p>
            <p>
              4. Click on any “Thought” badge to re-open its Reality Check panel
              and revise your evidence.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Journal Entry with Tagging</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              onMouseUp={handleTextSelection}
              className="w-full h-40 p-4 rounded-lg border focus:ring-2 focus:ring-blue-500"
              placeholder="Start writing your journal entry here..."
            />
            {/* Floating Tag Menu */}
            <AnimatePresence>
              {showTagMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 bg-white rounded-lg shadow-lg p-2 flex gap-2"
                  style={{
                    left: tagMenuPosition.x,
                    top: tagMenuPosition.y,
                    transform: "translateX(-50%)"
                  }}
                >
                  {Object.entries(TAG_TYPES).map(([type, { label, icon: Icon, color }]) => (
                    <Button
                      key={type}
                      size="sm"
                      variant="ghost"
                      className={color}
                      onClick={() => addTag(type)}
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      {label}
                    </Button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {tags.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Tagged Entry:</h3>
              <div className="prose prose-sm">{renderEntry()}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reality Check Modal */}
      <AnimatePresence>
        {activeThoughtTag && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Click outside to close */}
            <div
              className="absolute inset-0"
              onClick={() => setActiveThoughtTag(null)}
            />
            <motion.div
              className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative z-10"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Reality Check for:
                </h2>
                <Button variant="ghost" onClick={() => setActiveThoughtTag(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <p className="bg-blue-100 text-blue-800 px-2 py-1 rounded inline-block mb-4">
                “{activeThoughtTag?.text}”
              </p>

              <div className="space-y-4">
                <div>
                  <h3 className="flex items-center gap-1 text-yellow-600 font-medium mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    Supporting Evidence
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {realityCheck.supporting.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addEvidence("supporting")}
                    className="mt-2"
                  >
                    Add Supporting
                  </Button>
                </div>

                <div>
                  <h3 className="flex items-center gap-1 text-blue-600 font-medium mb-2">
                    <Ban className="w-4 h-4" />
                    Contrary Evidence
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {realityCheck.contrary.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addEvidence("contrary")}
                    className="mt-2"
                  >
                    Add Contrary
                  </Button>
                </div>

                {/* Example summary or reflection */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">
                    Reflection:
                  </p>
                  <p className="text-sm text-gray-700">
                    Based on the evidence, how accurate does this thought seem?
                    Are there alternative ways to see the situation?
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setActiveThoughtTag(null)}>
                  Close
                </Button>
                <Button onClick={() => setActiveThoughtTag(null)}>
                  Done
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
