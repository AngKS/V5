"use client";

import { useState } from "react";
import { Icon } from "./icon";

const interests = [
  "AI Agents",
  "Computer Vision",
  "Explainable AI",
  "Infrastructure Engineering",
  "Design Thinking",
  "Human-AI Collaboration",
];

export function InterestsMarquee() {
  const [paused, setPaused] = useState(false);
  return (
    <div
      className="ticker"
      role="region"
      aria-label="Areas of interest"
      data-paused={paused}
    >
      <div className="ticker-window">
        <div className="ticker-track">
          {[0, 1].map((copy) => (
            <ul
              className="ticker-group"
              key={copy}
              aria-hidden={copy === 1 ? true : undefined}
            >
              {interests.map((interest) => (
                <li key={interest}>
                  {interest}
                  <Icon name="starburst" />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <button
        className="ticker-toggle"
        aria-label={
          paused ? "Resume scrolling interests" : "Pause scrolling interests"
        }
        onClick={() => setPaused(!paused)}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
          focusable="false"
        >
          {paused ? (
            <path d="M4 2 14 8 4 14Z" />
          ) : (
            <path d="M3 2h3v12H3zm7 0h3v12h-3z" />
          )}
        </svg>
      </button>
    </div>
  );
}
