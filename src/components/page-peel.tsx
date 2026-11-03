"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import "./skill-factory.css";

const SkillFactory = dynamic(() => import("./skill-factory"));

export function PagePeel() {
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return;
    }
    if (!wasOpen.current) return;
    const frame = requestAnimationFrame(() =>
      trigger.current?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(frame);
  }, [open]);
  return (
    <>
      <button
        ref={trigger}
        className="page-peel"
        aria-label="Peel back the page to explore my skills factory"
        aria-expanded={open}
        title="Under the surface: explore my skills factory"
        onClick={() => {
          setOpen(true);
          trigger.current?.closest("section")?.scrollIntoView({
            block: "start",
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "instant"
              : "smooth",
          });
        }}
        hidden={open}
      >
        <span className="peel-underlay" aria-hidden="true">
          <svg
            viewBox="0 0 80 80"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M35 68V44l10 5V35l12 7V24h10v44ZM35 59h32M44 53v6m10-6v6m8-6v6" />
          </svg>
        </span>
        <span className="peel-paper" aria-hidden="true" />
        <span className="peel-hint">Under the surface</span>
      </button>
      {open && (
        <Suspense fallback={null}>
          <SkillFactory onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
}
