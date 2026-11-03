"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

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

function Machine({ kind }: { kind: string }) {
  return (
    <svg
      className="factory-machine"
      viewBox="0 0 300 150"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path
        className="machine-wire"
        d="M0 119h35V98h28m174 0h28v21h35M150 0v18"
      />
      <path
        opacity=".3"
        d="M20 135h260M30 131v8m240-8v8M24 24h16m-8-8v16M260 24h16m-8-8v16"
      />
      {kind === "agents" && (
        <>
          <path
            d="M65 48h65m40 0h65M65 48v53h65m40 0h65V48M150 48v53"
            className="machine-wire"
          />
          {[65, 150, 235].map((x, i) => (
            <g key={x}>
              <rect
                x={x - 23}
                y={i === 1 ? 77 : 24}
                width="46"
                height="46"
                rx="5"
              />
              <path d={`M${x - 10} ${i === 1 ? 91 : 38}h20m-20 8h14`} />
              <circle
                className="machine-lamp"
                cx={x + 14}
                cy={i === 1 ? 112 : 59}
                r="2"
              />
            </g>
          ))}
          <circle cx="150" cy="42" r="18" />
          <path d="m141 42 6 6 12-12" />
        </>
      )}
      {kind === "vision" && (
        <>
          <path d="M46 30h208v83H46zM62 42h176v58H62zM116 113v13m68-13v13M100 126h100" />
          <path d="M83 72q67-67 134 0-67 62-134 0Z" />
          <circle cx="150" cy="70" r="23" />
          <circle cx="150" cy="70" r="9" />
          <path d="M108 45v-9h16m52 0h16v9m0 43v17h-16m-52 0h-16V88" />
          <path className="machine-scan" d="M65 50h170" />
        </>
      )}
      {kind === "explain" && (
        <>
          <path d="M43 33h128v79H43zM55 99V47m0 52h103M65 89l22-27 21 11 22-25 18 10" />
          <path d="M70 112v12h76v-12M191 101l-11 24m48-24 12 24" />
          <circle cx="211" cy="64" r="34" />
          <circle cx="211" cy="64" r="24" />
          <path d="m234 89 19 21M197 75V57m9 18V49m9 26V60m9 15V54" />
          <path className="machine-wire" d="M157 69h20" />
        </>
      )}
      {kind === "infra" && (
        <>
          {[55, 121, 187].map((x) => (
            <g key={x}>
              <rect x={x} y="25" width="54" height="91" rx="3" />
              {[39, 62, 85].map((y) => (
                <g key={y}>
                  <path d={`M${x + 8} ${y}h25m-25 6h25`} />
                  <circle
                    className="machine-lamp"
                    cx={x + 42}
                    cy={y + 3}
                    r="2"
                  />
                </g>
              ))}
              <path d={`M${x + 10} 116v9h34v-9`} />
            </g>
          ))}
          <path className="machine-wire" d="M82 25v-9h132v9M148 16V2" />
        </>
      )}
      {kind === "design" && (
        <>
          <path d="M45 31h121v72H45zM53 103l-10 24m115-24 10 24M36 70h139" />
          {[62, 91, 120].map((x, i) => (
            <path key={x} d={`M${x} ${44 + i * 3}h20v17h-20z`} />
          ))}
          <path d="M200 112h50M206 104h38v8h-38zM215 104V88q-35-36-9-51 29-15 41 11 8 21-12 40v16M215 91h20M221 89V66l-8-8m8 8 12-8" />
          <path className="machine-lamp" d="M190 24l-8-8m42 3V7m29 17 9-8" />
        </>
      )}
      {kind === "human" && (
        <>
          <path d="M60 104h180v15H60zM120 42h83v53h-83zM132 52h59v29h-59zM153 95v9" />
          <circle cx="73" cy="57" r="15" />
          <path d="M49 99V89q24-30 48 0v10M225 41h29v29h-29zM220 99V83h39v16m-32-45h5m14 0h5m-18 9h12" />
          <path className="machine-wire" d="M91 57h29m83 0h22M145 67h33" />
        </>
      )}
      <g className="machine-conveyor">
        <path d="M32 142h236" strokeDasharray="4 7" />
      </g>
    </svg>
  );
}

export default function SkillFactory({ onClose }: { onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);
  const [selected, setSelected] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
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
      ?.querySelector<HTMLButtonElement>(".factory-return-peel")
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
      className="factory-dialog"
      aria-labelledby="factory-title"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          setClosing(true);
        }
      }}
    >
      <motion.div
        className="factory-reveal"
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
          className="factory-return-peel"
          onClick={() => setClosing(true)}
          disabled={closing}
          aria-label="Peel back to the introduction"
          title="Peel back to the introduction"
        >
          <span className="return-peel-underlay" aria-hidden="true" />
          <span className="return-peel-paper" aria-hidden="true" />
        </button>
        <div className="factory-floor">
          <header className="factory-header">
            <div>
              <p>Behind the paper / Kah Shin’s workshop</p>
              <h2 id="factory-title">Where the ideas get built.</h2>
            </div>
          </header>
          <div className="factory-plan">
            <div className="factory-aisle" aria-hidden="true">
              <span>Ideas in</span>
              <span>Assembly line</span>
              <span>Into the world</span>
            </div>
            <div
              className="factory-rooms"
              role="group"
              aria-label="Explore the workshop rooms"
            >
              {rooms.map((room, index) => (
                <button
                  key={room.kind}
                  className="factory-room"
                  aria-pressed={selected === index}
                  aria-controls="factory-detail"
                  onClick={() => setSelected(index)}
                >
                  <span className="room-number">0{index + 1}</span>
                  <span className="room-station">{room.station}</span>
                  <Machine kind={room.kind} />
                  <strong>{room.name}</strong>
                  <span className="room-process">{room.steps}</span>
                </button>
              ))}
            </div>
            <div className="factory-pipe" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
          <div
            id="factory-detail"
            className="factory-detail"
            aria-live="polite"
            aria-atomic="true"
          >
            <span>Inside {rooms[selected].station.toLowerCase()}</span>
            <p>{rooms[selected].description}</p>
          </div>
          <footer className="factory-footer">
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
