"use client";

import { useEffect, useRef, useState } from "react";

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
  const region = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    let inView = false;
    const sync = () => setActive(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    if (region.current) observer.observe(region.current);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  return (
    <div
      ref={region}
      className="ticker"
      role="region"
      aria-label="Areas of interest"
      data-paused={paused || !active}
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
                  <span aria-hidden="true">·</span>
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
        type="button"
        aria-pressed={paused}
        title={paused ? "Tap to resume" : "Tap to pause"}
        onClick={() => setPaused((value) => !value)}
      ></button>
    </div>
  );
}
