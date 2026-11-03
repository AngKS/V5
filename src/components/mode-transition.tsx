"use client";
import { Icon } from "@/components/icon";

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
    const finish = setTimeout(onFinish, mode === "breach" ? 2400 : 5100);
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
              ["observe", "02 / CAPTURE THE MOMENT.", "/comics/observe.webp"],
              ["servers", "03 / BUILD THE SYSTEM."],
              [
                "collaborate",
                "04 / BUILD TOGETHER.",
                "/comics/collaborate.webp",
              ],
              ["audio", "05 / FIND THE SIGNAL."],
              ["experiment", "06 / TEST THE IDEA.", "/comics/experiment.webp"],
              ["eyes", "07 / STAY CURIOUS."],
              ["focus", "08 / FIND THE FLOW.", "/comics/focus.webp"],
              ["create", "09 / KEEP CREATING.", "/comics/create.webp"],
              ["portrait", "10 / THE HUMAN BEHIND IT ALL."],
            ].map(([scene, caption, artwork], index) => (
              <div
                className={`comic-shot comic-shot-${scene}${artwork ? " comic-shot-working" : ""}`}
                key={scene}
                style={{ animationDelay: `${index * 380}ms` }}
              >
                {artwork && (
                  <img
                    src={artwork}
                    alt=""
                    width={960}
                    height={960}
                    className="comic-working-art"
                  />
                )}
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
        Skip transition <Icon name="enter" />
      </button>
    </dialog>
  );
}
