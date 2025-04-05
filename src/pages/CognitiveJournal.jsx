"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tag, Heart, Brain, Activity } from "lucide-react";

// Define the available tag types with labels, icons, and color classes.
const TAG_TYPES = {
  action: {
    label: "Action",
    icon: Activity,
    color: "bg-green-100 text-green-800 hover:bg-green-200"
  },
  feeling: {
    label: "Feeling",
    icon: Heart,
    color: "bg-red-100 text-red-800 hover:bg-red-200"
  },
  thought: {
    label: "Thought",
    icon: Brain,
    color: "bg-blue-100 text-blue-800 hover:bg-blue-200"
  }
};

export default function JournalInputAndTagging() {
  const [entry, setEntry] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedText, setSelectedText] = useState("");
  const [showTagMenu, setShowTagMenu] = useState(false);
  const [tagMenuPosition, setTagMenuPosition] = useState({ x: 0, y: 0 });
  const textareaRef = useRef(null);

  // When the user selects text, show a floating menu at the selection.
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

  // When a tag option is clicked, add the tag to the entry.
  const addTag = (type) => {
    if (selectedText) {
      // Find the first occurrence of the selected text.
      const startIndex = entry.indexOf(selectedText);
      if (startIndex !== -1) {
        const newTag = {
          id: Date.now(),
          text: selectedText,
          type,
          startIndex,
          endIndex: startIndex + selectedText.length
        };
        setTags([...tags, newTag]);
      }
      setShowTagMenu(false);
      setSelectedText("");
    }
  };

  // Render the journal entry with tagged portions highlighted.
  const renderEntry = () => {
    if (!entry) return null;
    let elements = [];
    let lastIndex = 0;
    // Sort tags by their start index.
    const sortedTags = [...tags].sort((a, b) => a.startIndex - b.startIndex);
    sortedTags.forEach((tag, index) => {
      // Add normal text before the tag.
      if (tag.startIndex > lastIndex) {
        elements.push(
          <span key={`text-${index}`}>
            {entry.slice(lastIndex, tag.startIndex)}
          </span>
        );
      }
      // Render the tagged text inside a badge.
      const TagIcon = TAG_TYPES[tag.type].icon;
      elements.push(
        <Badge
          key={tag.id}
          className={`inline-flex items-center gap-1 mx-1 ${TAG_TYPES[tag.type].color}`}
        >
          <TagIcon className="w-3 h-3" />
          {entry.slice(tag.startIndex, tag.endIndex)}
        </Badge>
      );
      lastIndex = tag.endIndex;
    });
    // Append any remaining text.
    if (lastIndex < entry.length) {
      elements.push(<span key="text-end">{entry.slice(lastIndex)}</span>);
    }
    return elements;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
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
                      className={`${color}`}
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
    </div>
  );
}
