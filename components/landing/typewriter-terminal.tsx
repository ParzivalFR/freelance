"use client";

import { useEffect, useState } from "react";

interface TerminalLine {
  type: "command" | "output" | "success" | "info";
  text: string;
  delay: number;
}

const terminalSequence: TerminalLine[] = [
  {
    type: "command",
    text: "npx create-next-app@latest client-project",
    delay: 0,
  },
  {
    type: "output",
    text: "✓ Creating a new Next.js app in /client-project",
    delay: 2000,
  },
  { type: "command", text: "cd client-project", delay: 3500 },
  { type: "command", text: "pnpm install", delay: 4500 },
  {
    type: "command",
    text: "pnpm add @prisma/client tailwindcss framer-motion",
    delay: 5500,
  },
  { type: "output", text: "✓ Packages installed successfully", delay: 7000 },
  { type: "command", text: "git init && git add .", delay: 8000 },
  {
    type: "command",
    text: 'git commit -m "feat: initial project setup"',
    delay: 9000,
  },
  { type: "success", text: "✓ Repository initialized", delay: 10000 },
  { type: "command", text: "pnpm dev", delay: 11000 },
  { type: "info", text: "🚀 Ready on http://localhost:3000", delay: 12500 },
  { type: "info", text: "⚡ Project ready for development!", delay: 13500 },
];

export default function TypewriterTerminal() {
  const [visibleLines, setVisibleLines] = useState<TerminalLine[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  // Main typing animation
  useEffect(() => {
    if (currentLineIndex >= terminalSequence.length) return;

    const currentLine = terminalSequence[currentLineIndex];

    const startTyping = () => {
      let charIndex = 0;
      const typeInterval = setInterval(() => {
        if (charIndex < currentLine.text.length) {
          setCurrentText(currentLine.text.slice(0, charIndex + 1));
          charIndex++;
        } else {
          clearInterval(typeInterval);

          // Line completed, add to visible lines
          setTimeout(() => {
            setVisibleLines((prev) => [...prev, currentLine]);
            setCurrentText("");
            setCurrentLineIndex((prev) => prev + 1);
          }, 500);
        }
      }, 50); // Typing speed

      return () => clearInterval(typeInterval);
    };

    const timer = setTimeout(startTyping, currentLine.delay);
    return () => clearTimeout(timer);
  }, [currentLineIndex]);

  const getLineColor = (type: TerminalLine["type"]) => {
    switch (type) {
      case "command":
        return "text-blue-400";
      case "output":
        return "text-gray-300";
      case "success":
        return "text-green-400";
      case "info":
        return "text-yellow-400";
      default:
        return "text-gray-300";
    }
  };

  const getPrompt = (type: TerminalLine["type"]) => {
    return type === "command" ? "$ " : "";
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="shadow-2xl overflow-hidden rounded-lg border border-gray-800 bg-gray-900">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="size-3 rounded-full bg-red-500"></div>
            <div className="size-3 rounded-full bg-yellow-500"></div>
            <div className="size-3 rounded-full bg-green-500"></div>
          </div>
          <div className="font-mono text-sm text-gray-400">
            terminal — zsh — 80×24
          </div>
          <div></div>
        </div>

        {/* Terminal Content */}
        <div className="min-h-[300px] bg-gray-900 p-4 text-left font-mono text-sm leading-relaxed">
          {/* Visible completed lines */}
          {visibleLines.map((line, index) => (
            <div
              key={index}
              className={`${getLineColor(line.type)} mb-1 text-left`}
            >
              {getPrompt(line.type)}
              {line.text}
            </div>
          ))}

          {/* Current typing line */}
          {currentLineIndex < terminalSequence.length && (
            <div
              className={`${getLineColor(
                terminalSequence[currentLineIndex].type
              )} mb-1 text-left`}
            >
              {getPrompt(terminalSequence[currentLineIndex].type)}
              {currentText}
              {showCursor && (
                <span className="ml-0.5 bg-gray-300 text-gray-900">▋</span>
              )}
            </div>
          )}

          {/* Empty prompt after completion */}
          {currentLineIndex >= terminalSequence.length && (
            <div className="mt-4 text-left text-blue-400">
              ${" "}
              {showCursor && (
                <span className="ml-0.5 bg-gray-300 text-gray-900">▋</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
