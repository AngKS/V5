"use client";
import { useEffect, useRef } from "react";
import "./mode-transition.css";
import { BreachSequence } from "./breach-sequence";

export function ModeTransition({
  mode,
  onCommit,
  onFinish,
}: {
  mode: "breach" | "restore";
  onCommit: () => void;
  onFinish: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const root = document.documentElement;
    const overflow = document.body.style.overflow;
    const main = document.querySelector("main");
    root.style.setProperty(
      "--shift-origin",
      `${window.innerHeight / 2 - (main?.getBoundingClientRect().top ?? 0)}px`,
    );
    root.dataset.modeShift = mode;
    document.body.style.overflow = "hidden";
    dialog.current?.showModal();
    const commit = setTimeout(onCommit, mode === "breach" ? 650 : 800);
    const finish = setTimeout(onFinish, mode === "breach" ? 2400 : 3200);
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const preferenceChanged = () => {
      if (media.matches) {
        onCommit();
        onFinish();
      }
    };
    media.addEventListener("change", preferenceChanged);
    return () => {
      clearTimeout(commit);
      clearTimeout(finish);
      media.removeEventListener("change", preferenceChanged);
      delete root.dataset.modeShift;
      root.style.removeProperty("--shift-origin");
      document.body.style.overflow = overflow;
    };
  }, [mode, onCommit, onFinish]);
  const skip = () => {
    onCommit();
    onFinish();
  };
  return (
    <dialog
      ref={dialog}
      className={`mode-transition ${mode}-transition`}
      aria-label={
        mode === "breach" ? "Entering breach mode" : "Restoring original page"
      }
      onCancel={(event) => {
        event.preventDefault();
        skip();
      }}
    >
      <div className="transition-art" aria-hidden="true">
        {mode === "breach" ? (
          <BreachSequence />
        ) : (
          <div className="comic-sequence">
            {[
              ["detail", "01 / LOOK CLOSER."],
              ["servers", "02 / BUILD THE SYSTEM."],
              ["audio", "03 / FIND THE SIGNAL."],
              ["eyes", "04 / STAY CURIOUS."],
              ["portrait", "05 / THE HUMAN BEHIND IT ALL."],
            ].map(([scene, caption], index) => (
              <div
                className={`comic-shot comic-shot-${scene}`}
                key={scene}
                style={{ animationDelay: `${index * 380}ms` }}
              >
                <span className="comic-cut-caption">{caption}</span>
              </div>
            ))}
            <div className="comic-page">
              <div className="comic-artwork" />
              <span className="comic-caption">
                MEANWHILE, BACK IN THE REAL WORLD...
              </span>
              <strong className="comic-stamp">
                BACK TO
                <br />
                THE HUMAN.
              </strong>
              <span className="comic-issue">ANGKS / VOL. 05</span>
            </div>
            <div className="comic-speed-lines" />
          </div>
        )}
      </div>
      <button className="transition-skip" onClick={skip} autoFocus>
        Skip transition ↵
      </button>
    </dialog>
  );
}
