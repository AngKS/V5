"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { pandaPaths } from "@/content/panda";

const SESSION_KEY = "v5:panda-intro-seen";

export function PandaIntro({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const content = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);

  function dismiss() {
    const restoreFocus = overlay.current?.contains(document.activeElement);
    setActive(false);
    if (restoreFocus) {
      requestAnimationFrame(() =>
        content.current?.focus({ preventScroll: true }),
      );
    }
  }

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Deep links and return visits go straight to the content.
    if (preference.matches || window.location.hash || document.hidden) return;
    try {
      if (sessionStorage.getItem(SESSION_KEY)) return;
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      // Storage can be unavailable in privacy modes; the intro remains skippable.
    }
    setActive(true);
  }, []);

  useEffect(() => {
    if (!active) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timer = window.setTimeout(dismiss, 2400);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    const onPreference = () => {
      if (preference.matches) dismiss();
    };
    const onVisibility = () => {
      if (document.hidden) dismiss();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);
    preference.addEventListener("change", onPreference);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
      preference.removeEventListener("change", onPreference);
    };
  }, [active]);

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            ref={overlay}
            className="panda-intro"
            role="region"
            aria-label="Welcome animation"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, pointerEvents: "none" }}
            transition={{ duration: 0.2 }}
          >
            <div className="panda-intro-art" aria-hidden="true">
              <svg
                viewBox="-3 -3 197 207"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {pandaPaths.map((path, index) => (
                  <motion.path
                    key={path.name}
                    d={path.d}
                    stroke={path.eye ? "none" : "currentColor"}
                    strokeWidth={3}
                    strokeMiterlimit={10}
                    fill={path.eye ? "currentColor" : "none"}
                    initial={path.eye ? { opacity: 0 } : { pathLength: 0 }}
                    animate={path.eye ? { opacity: 1 } : { pathLength: 1 }}
                    transition={
                      path.eye
                        ? { delay: 1.35 + (index - 5) * 0.1, duration: 0.25 }
                        : {
                            duration: path.name === "face" ? 1.65 : 0.9,
                            delay: index * 0.12,
                            ease: "easeInOut",
                          }
                    }
                  />
                ))}
              </svg>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.4 }}
              >
                KAH SHIN
              </motion.p>
              <span className="eyebrow">A CURIOUS MIND. A FAMILIAR FACE.</span>
            </div>
            <button type="button" className="panda-skip" onClick={dismiss}>
              SKIP INTRO ↗
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={content} inert={active} tabIndex={-1} className="intro-content">
        {children}
      </div>
    </>
  );
}
