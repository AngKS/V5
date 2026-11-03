"use client";

import dynamic from "next/dynamic";
import { awardStamp, readStamps, BREACH_REPLAY_EVENT } from "@/lib/discoveries";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import "./terminal-hatch.css";

const Terminal = dynamic(() => import("./secret-terminal"));
const CyberBleed = dynamic(() => import("./cyber-bleed"));
const ModeTransition = dynamic(() =>
  import("./mode-transition").then((module) => module.ModeTransition),
);
const THRESHOLD = 720;

export function TerminalHatch() {
  const [open, setOpen] = useState(false);
  const [primed, setPrimed] = useState(false);
  const [breached, setBreached] = useState(false);
  const [transition, setTransition] = useState<"breach" | "restore" | null>(
    null,
  );
  const transitioning = useRef(false);
  const [pull, setPull] = useState(0);
  const trigger = useRef<HTMLButtonElement>(null);
  const [atHatch, setAtHatch] = useState(false);
  const cooldown = useRef(0);
  const applyMode = useCallback((mode: "breach" | "restore") => {
    setBreached(mode === "breach");
    if (mode === "breach") awardStamp("breach");
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    try {
      sessionStorage.setItem(
        "v5:cyber-breach",
        mode === "breach" ? "on" : "off",
      );
    } catch {}
  }, []);
  const beginTransition = useCallback(
    (mode: "breach" | "restore") => {
      if (transitioning.current) return;
      cooldown.current = Date.now() + 2500;
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        applyMode(mode);
        requestAnimationFrame(() => {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          document
            .querySelector<HTMLElement>(".header .wordmark")
            ?.focus({ preventScroll: true });
        });
        return;
      }
      transitioning.current = true;
      setTransition(mode);
    },
    [applyMode],
  );
  const close = useCallback(() => {
    setOpen(false);
    setPrimed(false);
    setPull(0);
    beginTransition("breach");
  }, [beginTransition]);
  useEffect(() => {
    const replay = () => {
      if (breached || transitioning.current || !readStamps().includes("breach"))
        return;
      setOpen(false);
      setPrimed(false);
      setPull(0);
      beginTransition("breach");
    };
    window.addEventListener(BREACH_REPLAY_EVENT, replay);
    return () => window.removeEventListener(BREACH_REPLAY_EVENT, replay);
  }, [breached, beginTransition]);

  const commitTransition = useCallback(() => {
    if (transition) applyMode(transition);
  }, [transition, applyMode]);
  const finishTransition = useCallback(() => {
    transitioning.current = false;
    setTransition(null);
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document
        .querySelector<HTMLElement>(".header .wordmark")
        ?.focus({ preventScroll: true });
    });
  }, []);

  useEffect(() => {
    if (open) awardStamp("terminal");
  }, [open]);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("v5:cyber-breach");
      setBreached(saved === "on");
    } catch {}
  }, []);

  useEffect(() => {
    const element = trigger.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      setAtHatch(entry.isIntersecting);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Ordinary scrolling stays on the browser's fast path. Only intercept
    // overscroll while the end-of-page hatch is actually in view.
    if (!atHatch || open || transition) return;
    let distance = 0;
    let last = 0;
    let touch: { x: number; y: number } | null = null;
    let resetTimer: ReturnType<typeof setTimeout>;
    const atBottom = () =>
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 4;
    const reset = () => {
      distance = 0;
      setPull(0);
    };
    const accumulate = (delta: number, event: Event) => {
      if (Date.now() < cooldown.current || !atBottom()) {
        reset();
        return;
      }
      if (delta <= 0) {
        reset();
        return;
      }
      if (event.cancelable) event.preventDefault();
      if (Date.now() - last > 1800) distance = 0;
      last = Date.now();
      // Cap individual wheel impulses so a single large scroll cannot open it.
      distance = Math.min(THRESHOLD, distance + Math.min(delta, 50));
      setPrimed(true);
      setPull(distance / THRESHOLD);
      clearTimeout(resetTimer);
      if (distance >= THRESHOLD) {
        setOpen(true);
        reset();
      } else resetTimer = setTimeout(reset, 1800);
    };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY))
        return;
      const scale =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? window.innerHeight
            : 1;
      accumulate(event.deltaY * scale, event);
    };
    const start = (event: TouchEvent) => {
      touch =
        event.touches.length === 1
          ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
          : null;
    };
    const move = (event: TouchEvent) => {
      if (!touch || event.touches.length !== 1) {
        touch = null;
        return;
      }
      const current = event.touches[0];
      const dy = touch.y - current.clientY;
      const dx = touch.x - current.clientX;
      touch = { x: current.clientX, y: current.clientY };
      if (Math.abs(dy) > Math.abs(dx)) accumulate(dy, event);
    };
    const end = () => {
      touch = null;
    };
    const scroll = () => {
      if (!atBottom()) reset();
    };
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("touchstart", start, { passive: true });
    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", end);
    window.addEventListener("touchcancel", end);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      clearTimeout(resetTimer);
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("touchstart", start);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", end);
      window.removeEventListener("touchcancel", end);
      window.removeEventListener("scroll", scroll);
    };
  }, [atHatch, open, transition]);

  return (
    <>
      <button
        ref={trigger}
        className="terminal-hatch"
        onClick={() => {
          if (!transitioning.current) {
            setPrimed(true);
            setOpen(true);
          }
        }}
        aria-label="Open hidden terminal"
      >
        <span aria-hidden="true">[ END OF TRANSMISSION ]</span>
      </button>
      {primed && (
        <Suspense fallback={null}>
          <Terminal isOpen={open} pull={pull} onClose={close} />
        </Suspense>
      )}
      {transition && (
        <ModeTransition
          mode={transition}
          onCommit={commitTransition}
          onFinish={finishTransition}
        />
      )}
      {breached && (
        <Suspense fallback={null}>
          <CyberBleed
            active={breached}
            onRestore={() => beginTransition("restore")}
          />
        </Suspense>
      )}
    </>
  );
}
