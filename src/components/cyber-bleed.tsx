"use client";
import { Icon } from "@/components/icon";

import { useEffect, useState, useSyncExternalStore } from "react";
import "./cyber-bleed.css";
import "./panda-mobile.css";
import { createPortal, preload } from "react-dom";
import Image from "next/image";
import { CyberPanda } from "./cyber-panda";
import { SectionRain } from "./section-rain";

const motionQuery = "(prefers-reduced-motion: reduce)";
function subscribeMotion(listener: () => void) {
  const query = window.matchMedia(motionQuery);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}
const readMotion = () => window.matchMedia(motionQuery).matches;
const serverMotion = () => true;

export default function CyberBleed({
  active,
  onRestore,
}: {
  active: boolean;
  onRestore: () => void;
}) {
  const [portrait, setPortrait] = useState<HTMLElement | null>(null);
  const [aboutTitle, setAboutTitle] = useState<HTMLElement | null>(null);
  const [heroCopy, setHeroCopy] = useState<HTMLElement | null>(null);
  const [portraitReady, setPortraitReady] = useState(false);
  const [sections, setSections] = useState<HTMLElement[]>([]);
  const reduced = useSyncExternalStore(
    subscribeMotion,
    readMotion,
    serverMotion,
  );
  useEffect(() => {
    document.documentElement.classList.toggle("cyber-breach", active);
    return () => document.documentElement.classList.remove("cyber-breach");
  }, [active]);
  useEffect(() => {
    preload("/media/comic-transition.webp", { as: "image" });
    ["observe", "collaborate", "experiment", "focus", "create"].forEach(
      (scene) => preload(`/comics/${scene}.webp`, { as: "image" }),
    );
    setPortrait(document.querySelector<HTMLElement>(".portrait-stage"));
    setHeroCopy(document.querySelector<HTMLElement>(".intro-copy"));
    setAboutTitle(document.querySelector<HTMLElement>(".about-title"));
    setSections(
      Array.from(document.querySelectorAll<HTMLElement>("main > section")),
    );
  }, []);
  return (
    <>
      {active && <div className="cyber-backdrop" aria-hidden="true" />}
      {active && heroCopy && createPortal(<CyberPanda />, heroCopy)}
      {active &&
        aboutTitle &&
        createPortal(<CyberPanda variant="laptop" />, aboutTitle)}
      {active &&
        portrait &&
        createPortal(
          <Image
            className="intro-portrait cyber-portrait"
            src="/face-cyber.png"
            alt="Cybernetic portrait of Kah Shin: half human, half robot, with a glowing cyan eye"
            width={1446}
            height={1087}
            sizes="(max-width: 700px) 115vw, (max-width: 1200px) 60vw, 700px"
            loading="eager"
            data-ready={portraitReady}
            onLoad={() => setPortraitReady(true)}
          />,
          portrait,
        )}
      {active &&
        !reduced &&
        sections.map((section, index) =>
          createPortal(<SectionRain />, section, `rain-${index}`),
        )}
      {active && (
        <div className="cyber-atmosphere" aria-hidden="true">
          <svg className="cyber-circuits" width="100%" height="100%">
            <defs>
              <pattern
                id="circuit-grid"
                width="360"
                height="280"
                patternUnits="userSpaceOnUse"
              >
                <g fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M0 35h42l22 22v75l30 30h36m230 50h-45l-28-28v-65l-20-20h-45M0 240h65l20-20h40v-45M360 15h-70l-18 18v38h-40" />
                  <circle cx="130" cy="162" r="4" />
                  <circle cx="222" cy="99" r="4" />
                  <circle cx="125" cy="175" r="3" />
                  <circle cx="232" cy="71" r="3" />
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit-grid)" />
          </svg>
        </div>
      )}
      <button className="cyber-switch" type="button" onClick={onRestore}>
        <span aria-hidden="true">
          <Icon name="breach" />
        </span>{" "}
        BREACH ACTIVE / RESTORE
      </button>
    </>
  );
}
