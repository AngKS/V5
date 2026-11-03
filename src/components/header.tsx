"use client";
import { Icon } from "@/components/icon";
import { LEGACY_RESUME } from "@/lib/files";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
export function Header() {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const menuRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const dismissOutside = (event: PointerEvent) => {
      const target = event.target;
      if (
        target instanceof Node &&
        !menuRef.current?.contains(target) &&
        !toggleRef.current?.contains(target)
      )
        setOpen(false);
    };
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", dismissOutside, true);
    document.addEventListener("keydown", dismissOnEscape);
    return () => {
      document.removeEventListener("pointerdown", dismissOutside, true);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [open]);
  const links = [
    ["About", "about"],
    ["Portfolio", "portfolio"],
    ["Writing", "writing"],
    ["Contact", "contact"],
  ];
  return (
    <header className="header">
      <a
        className="wordmark"
        data-cyber="ANGKS"
        href="#home"
        aria-label="Kah Shin, home"
      >
        ANGKS
        <span>
          <Icon name="starburst" />
        </span>
      </a>
      <nav className="desktop-nav" aria-label="Main navigation">
        {links.map(([label, id]) => (
          <a key={id} href={`#${id}`} data-cyber={label}>
            {label}
          </a>
        ))}
      </nav>
      <a className="header-note" href="#contact">
        LET’S TALK{" "}
        <span>
          <Icon name="arrow-up-right" />
        </span>
      </a>
      <button
        ref={toggleRef}
        className="menu-button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(!open)}
      >
        {open ? "CLOSE" : "MENU"} <Icon name={open ? "minus" : "plus"} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.nav
            ref={menuRef}
            id="mobile-menu"
            className="mobile-nav"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: reduced ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {links.map(([label, id]) => (
              <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
                {label} <Icon name="arrow-up-right" />
              </a>
            ))}
            <a
              className="mobile-resume-button"
              href={LEGACY_RESUME}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              aria-label="My Resume (PDF on Google Drive, opens in a new tab)"
            >
              My Resume <Icon name="arrow-up-right" />
            </a>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
