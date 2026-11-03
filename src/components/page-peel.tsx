"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { PageCurl } from "./page-curl";

const SkillFactory = dynamic(() => import("./skill-factory"));

export function PagePeel() {
  const trigger = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [breached, setBreached] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const syncMode = () => {
      const active = root.classList.contains("cyber-breach");
      setBreached(active);
      if (active) {
        wasOpen.current = false;
        setOpen(false);
      }
    };
    syncMode();
    const observer = new MutationObserver(syncMode);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  const wasOpen = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      return;
    }
    if (breached || !wasOpen.current) return;
    const frame = requestAnimationFrame(() =>
      trigger.current?.focus({ preventScroll: true }),
    );
    return () => cancelAnimationFrame(frame);
  }, [open, breached]);
  if (breached) return null;
  return (
    <>
      <button
        ref={trigger}
        className="page-peel"
        aria-label="Peel back the page to explore my interests"
        aria-expanded={open}
        title="Under the surface: a walk through my interests"
        onClick={() => {
          if (document.documentElement.classList.contains("cyber-breach"))
            return;
          setOpen(true);
        }}
        hidden={open}
      >
        <PageCurl corner="bottom-right" />
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
