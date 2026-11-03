"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { SkillMachine } from "./skill-machine";
import "./mobile-skill-factory.css";

const rooms = [
  {
    name: "AI Agents",
    station: "Orchestration bay",
    description:
      "Connecting reasoning, tools and feedback into useful workflows.",
    steps: "Plan / Act / Observe",
    kind: "agents",
  },
  {
    name: "Computer Vision",
    station: "Optics workshop",
    description:
      "Exploring what machines see, from images to meaningful signals.",
    steps: "Capture / Detect / Understand",
    kind: "vision",
  },
  {
    name: "Explainable AI",
    station: "Inspection lab",
    description:
      "Looking beyond predictions to understand how a model arrived there.",
    steps: "Predict / Inspect / Explain",
    kind: "explain",
  },
  {
    name: "Infrastructure Engineering",
    station: "Power & systems",
    description:
      "Building the systems and services that bring ideas into the real world.",
    steps: "Connect / Deploy / Operate",
    kind: "infra",
  },
  {
    name: "Design Thinking",
    station: "Prototype studio",
    description:
      "Turning questions into experiments, then learning from what happens.",
    steps: "Ask / Prototype / Iterate",
    kind: "design",
  },
  {
    name: "Human-AI Collaboration",
    station: "Control room",
    description:
      "Exploring how people and intelligent tools can work better together.",
    steps: "Listen / Collaborate / Refine",
    kind: "human",
  },
] as const;

export default function MobileSkillFactory({
  onClose,
}: {
  onClose: () => void;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const [selected, setSelected] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    const section = panel.current?.closest("section");
    if (section)
      window.scrollTo({
        top: section.getBoundingClientRect().top + window.scrollY,
        behavior: "instant",
      });
    const siblings = Array.from(
      panel.current?.parentElement?.children ?? [],
    ).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement &&
        element !== panel.current &&
        !element.classList.contains("page-peel"),
    );
    const previous = siblings.map((element) => ({
      element,
      inert: element.inert,
      hidden: element.getAttribute("aria-hidden"),
    }));
    siblings.forEach((element) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });
    panel.current
      ?.querySelector<HTMLButtonElement>(".floorplan-return-peel")
      ?.focus({ preventScroll: true });
    return () =>
      previous.forEach(({ element, inert, hidden }) => {
        element.inert = inert;
        if (hidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", hidden);
      });
  }, []);
  const folded =
    "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%)";
  const half = "polygon(100% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 100%)";
  const unfolded = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%)";
  return (
    <div
      ref={panel}
      role="region"
      className="floorplan-dialog"
      aria-labelledby="floorplan-title"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          setClosing(true);
        }
      }}
    >
      <motion.div
        className="floorplan-reveal"
        initial={reduced ? false : { clipPath: folded }}
        animate={{
          clipPath: reduced
            ? closing
              ? folded
              : unfolded
            : closing
              ? [unfolded, half, folded]
              : [folded, half, unfolded],
        }}
        transition={{ duration: reduced ? 0 : 0.7, ease: [0.65, 0, 0.2, 1] }}
        onAnimationComplete={() => {
          if (closing) {
            onClose();
          }
        }}
      >
        <button
          className="floorplan-return-peel"
          onClick={() => setClosing(true)}
          disabled={closing}
          aria-label="Peel back to the introduction"
          title="Peel back to the introduction"
        >
          <span className="return-peel-underlay" aria-hidden="true" />
          <span className="return-peel-paper" aria-hidden="true" />
        </button>
        <div className="floorplan-floor">
          <header className="floorplan-header">
            <div>
              <p>Behind the paper / Kah Shin’s workshop</p>
              <h2 id="floorplan-title">Where the ideas get built.</h2>
            </div>
          </header>
          <div className="floorplan-plan">
            <div className="floorplan-aisle" aria-hidden="true">
              <span>Ideas in</span>
              <span>Assembly line</span>
              <span>Into the world</span>
            </div>
            <div
              className="floorplan-rooms"
              role="group"
              aria-label="Explore the workshop rooms"
            >
              {rooms.map((room, index) => (
                <button
                  key={room.kind}
                  className="floorplan-room"
                  aria-pressed={selected === index}
                  aria-controls="floorplan-detail"
                  onClick={() => setSelected(index)}
                >
                  <span className="room-number">0{index + 1}</span>
                  <span className="room-station">{room.station}</span>
                  <SkillMachine kind={room.kind} />
                  <strong>{room.name}</strong>
                  <span className="room-process">{room.steps}</span>
                </button>
              ))}
            </div>
            <div className="floorplan-pipe" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
          <div
            id="floorplan-detail"
            className="floorplan-detail"
            aria-live="polite"
            aria-atomic="true"
          >
            <span>Inside {rooms[selected].station.toLowerCase()}</span>
            <p>{rooms[selected].description}</p>
          </div>
          <footer className="floorplan-footer">
            <span>
              A floor plan of my interests. Always under construction.
            </span>
            <span>Select a room to take a closer look.</span>
          </footer>
        </div>
      </motion.div>
    </div>
  );
}
