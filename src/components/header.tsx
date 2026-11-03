"use client";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
export function Header() {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
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
        ANGKS<span>✳</span>
      </a>
      <nav className="desktop-nav" aria-label="Main navigation">
        {links.map(([label, id]) => (
          <a key={id} href={`#${id}`} data-cyber={label}>
            {label}
          </a>
        ))}
      </nav>
      <a className="header-note" href="#contact">
        LET’S TALK <span>↗</span>
      </a>
      <button
        className="menu-button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(!open)}
      >
        {open ? "CLOSE −" : "MENU +"}
      </button>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            className="mobile-nav"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: reduced ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {links.map(([label, id]) => (
              <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>
                {label} ↗
              </a>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
