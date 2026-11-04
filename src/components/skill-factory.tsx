"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SkillMachine } from "./skill-machine";
import { useWalkingCutout } from "./use-walking-cutout";
import { PageCurl } from "./page-curl";
import "./skill-factory.css";
import {
  motion,
  useMotionValueEvent,
  useMotionValue,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
function subscribeReducedMotion(listener: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}
const readReducedMotion = () => window.matchMedia(reducedMotionQuery).matches;
const serverReducedMotion = () => true;

const interests = [
  {
    name: "AI Agents",
    detail: "Reason. Act. Learn.",
    description:
      "Connecting reasoning, tools and feedback into useful workflows.",
    kind: "agents",
  },
  {
    name: "Computer Vision",
    detail: "A different way of seeing.",
    description: "Turning images into meaningful signals and understanding.",
    kind: "vision",
  },
  {
    name: "Explainable AI",
    detail: "Look beyond the prediction.",
    description: "Understanding what a model sees and why it makes a decision.",
    kind: "explain",
  },
  {
    name: "Infra Engineering",
    detail: "Make the idea work.",
    description:
      "Building the systems and services that bring ideas into the real world.",
    kind: "infra",
  },
  {
    name: "Design Thinking",
    detail: "Stay curious. Keep making.",
    description:
      "Turning questions into experiments, then learning from what happens.",
    kind: "design",
  },
  {
    name: "Human-AI Collaboration",
    detail: "Better, together.",
    description:
      "Exploring how people and intelligent tools can work better together.",
    kind: "human",
  },
] as const;

function Portrait({
  index,
  progress,
  reduced,
  mobile,
}: {
  index: number;
  progress: MotionValue<number>;
  reduced: boolean;
  mobile: boolean;
}) {
  const interest = interests[index];
  // Mobile gets six separate passes, with a small gap before the next poster.
  // The name reveal follows as the last poster clears the viewport.
  const start = mobile ? 0.01 + index * 0.126 : index * 0.105 * 0.78;
  const end = start + (mobile ? 0.118 : 0.46 * 0.78);
  const fade = mobile ? 0.012 : 0.035;
  const opacity = useTransform(
    progress,
    [start, start + fade, end - fade, end],
    [0, 1, 1, 0],
  );
  const x = useTransform(
    progress,
    mobile ? [start, start + 0.035, end - 0.035, end] : [start, end],
    mobile ? ["105vw", "24vw", "16vw", "-70vw"] : ["110vw", "-70vw"],
  );
  const y = useTransform(
    progress,
    [start, mobile ? (start + end) / 2 : start + 0.23, end],
    [18, -18, 18],
  );
  const rotate = useTransform(progress, [start, end], [3, -3]);
  const [visible, setVisible] = useState(false);
  useMotionValueEvent(opacity, "change", (value) => setVisible(value > 0.4));

  return (
    <motion.article
      className={`walk-portrait walk-portrait--${interest.kind}`}
      style={reduced ? undefined : { opacity, x, y, rotate }}
      aria-hidden={!reduced && !visible}
    >
      <div className="walk-portrait-top">
        <span>THE CURIOSITY CHRONICLES</span>
        <span>0{index + 1} / 06</span>
      </div>
      <div className="walk-comic-art" aria-hidden="true">
        <span className="walk-comic-burst" />
        <SkillMachine kind={interest.kind} />
        <span className="walk-comic-word">
          {
            ["THINK!", "LOOK!", "WHY?", "BUILD!", "WHAT IF?", "TOGETHER!"][
              index
            ]
          }
        </span>
      </div>
      <div className="walk-portrait-copy">
        <p>{interest.detail}</p>
        <h3>{interest.name}</h3>
        <span>{interest.description}</span>
      </div>
    </motion.article>
  );
}

/** A still, edge-to-edge poster wall for the reduced-motion scene. */
function PosterBackdrop({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="walk-poster-backdrop">
      <div className="walk-poster-plane">
        {[0, 1, 2, 3].map((copy) => (
          <div
            className="walk-poster-group"
            key={copy}
            aria-hidden={copy > 0 ? true : undefined}
          >
            {interests.map((interest, index) => (
              <Portrait
                key={interest.kind}
                index={index}
                progress={progress}
                reduced
                mobile
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// The same comic imagery used by the breach-to-normal sequence, clipped into
// the name. Scroll drives the cuts, so reversing never starts a timed takeover.
const finaleArtwork = [
  "/media/comic-transition.webp",
  "/comics/observe.webp",
  "/comics/collaborate.webp",
  "/comics/experiment.webp",
  "/comics/create.webp",
];

function FinaleFrame({
  index,
  artwork,
  progress,
  mobile,
}: {
  index: number;
  artwork?: string;
  progress: MotionValue<number>;
  mobile: boolean;
}) {
  const start = (mobile ? 0.77 : 0.75) + index * 0.034;
  const opacity = useTransform(
    progress,
    [start, start + 0.006, start + 0.034, Math.min(1, start + 0.042)],
    [0, 1, 1, artwork ? 0 : 1],
  );
  const scale = useTransform(
    progress,
    [start, Math.min(1, start + 0.042)],
    [1.12, 1],
  );
  return (
    <motion.div
      className={`walk-finale-name${artwork ? "" : " walk-finale-settled"}`}
      style={{
        opacity,
        scale,
        backgroundImage: artwork ? `url(${artwork})` : undefined,
      }}
    >
      <span>KAH</span> <span>SHIN</span>
    </motion.div>
  );
}

export default function SkillFactory({ onClose }: { onClose: () => void }) {
  const track = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const { painted, unavailable } = useWalkingCutout(video, canvas);
  const desiredTime = useRef(0);
  const seekFrame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(seekFrame.current), []);
  const closingRef = useRef(false);
  const returnTop = useRef(0);
  const [closing, setClosing] = useState(false);
  const sceneProgress = useMotionValue(0);
  const reduced = useSyncExternalStore(
    subscribeReducedMotion,
    readReducedMotion,
    serverReducedMotion,
  );
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [complete, setComplete] = useState(false);
  // Resolve the viewport before choosing a source so phones never fetch both.
  const [mobile, setMobile] = useState<boolean | null>(null);
  // Normal motion retains the scroll-driven journey on mobile and desktop.
  const staticMode = reduced || failed || unavailable;
  const { scrollYProgress } = useScroll({
    target: track,
    offset: ["start start", "end end"],
  });
  const progressScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    const breakpoint = window.matchMedia("(max-width: 700px)");
    const syncLayout = () => setMobile(breakpoint.matches);
    syncLayout();
    breakpoint.addEventListener("change", syncLayout);
    return () => breakpoint.removeEventListener("change", syncLayout);
  }, []);

  // Only issue a new seek after the previous frame is decoded. Repeatedly
  // interrupting an in-flight seek makes scroll-driven video stutter on Safari.
  function seekToProgress(progress: number) {
    const media = video.current;
    if (!media || !Number.isFinite(media.duration)) return;
    desiredTime.current =
      Math.round(progress * Math.max(0, media.duration * 30 - 1)) / 30;
    if (
      !media.seeking &&
      Math.abs(media.currentTime - desiredTime.current) > 1 / 60
    ) {
      media.currentTime = desiredTime.current;
    }
  }
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (closingRef.current) return;
    sceneProgress.set(value);
    setComplete(value >= 0.995);
    if (!staticMode) seekToProgress(value);
  });

  useEffect(() => {
    const section = track.current?.closest("section");
    if (!section) return;
    // The reveal takes the introduction's place, and expands into a native
    // scroll track. The sticky stage pins every visible pixel until its end.
    returnTop.current = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: returnTop.current,
      behavior: "instant",
    });
    track.current
      ?.querySelector<HTMLButtonElement>(".walk-return-flap")
      ?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (ready || staticMode) return;
    const media = video.current;
    const loaded = () => {
      if (media && media.readyState >= 2) {
        setReady(true);
        setFailed(false);
      }
    };
    media?.addEventListener("loadeddata", loaded);
    media?.addEventListener("canplay", loaded);
    loaded();
    const timeout = window.setTimeout(() => {
      if (media && media.readyState >= 2) loaded();
      else setFailed(true);
    }, 12000);
    return () => {
      window.clearTimeout(timeout);
      media?.removeEventListener("loadeddata", loaded);
      media?.removeEventListener("canplay", loaded);
    };
  }, [ready, staticMode]);

  useEffect(() => {
    if (closing)
      window.scrollTo({ top: returnTop.current, behavior: "instant" });
  }, [closing]);

  function close() {
    if (closingRef.current) return;
    closingRef.current = true;
    if (reduced) {
      onClose();
      window.scrollTo({ top: returnTop.current, behavior: "instant" });
    } else {
      setClosing(true);
    }
  }

  return (
    <div
      ref={track}
      className={`factory-dialog${staticMode ? " walk-static" : ""}${reduced ? " walk-poster-scene" : ""}${closing ? " walk-closing" : ""}`}
      role="region"
      aria-label="A walk through my interests"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      }}
    >
      <div className="factory-reveal">
        <motion.div
          className="walk-stage"
          initial={false}
          animate={{
            clipPath: closing
              ? [
                  "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%)",
                  "polygon(100% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 100%)",
                  "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%, 100% 100%)",
                ]
              : "none",
          }}
          transition={{ duration: reduced ? 0 : 0.75, ease: [0.65, 0, 0.2, 1] }}
          onAnimationComplete={() => {
            if (closingRef.current) onClose();
          }}
        >
          <button
            className="walk-return-flap"
            onClick={close}
            disabled={closing}
            aria-label="Flip back to introduction and work experience"
            title="Flip back to work experience"
          >
            <PageCurl />
          </button>
          <video
            ref={video}
            className="walk-source"
            src={
              staticMode || mobile === null
                ? undefined
                : `/video/kah-shin-walking-${mobile ? "mobile" : "desktop"}.mp4`
            }
            width={2560}
            height={720}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            onLoadedData={() => {
              setReady(true);
              setFailed(false);
              seekToProgress(sceneProgress.get());
            }}
            onError={() => setFailed(true)}
            onSeeked={() => {
              // Let the cutout consume this decoded frame before another seek.
              cancelAnimationFrame(seekFrame.current);
              seekFrame.current = requestAnimationFrame(() => {
                if (!closingRef.current && !staticMode)
                  seekToProgress(sceneProgress.get());
              });
            }}
          />
          {(!painted || staticMode) && (
            // A transparent first frame also serves reduced-motion / GPU fallback.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className="walk-video"
              src="/media/walking-cutout.webp"
              alt=""
              width={1280}
              height={720}
            />
          )}
          <canvas
            ref={canvas}
            className="walk-video"
            width={1280}
            height={720}
            aria-hidden="true"
            hidden={!painted || staticMode}
          />
          {!staticMode && (
            <div className="walk-finale" aria-hidden="true">
              {finaleArtwork.map((artwork, index) => (
                <FinaleFrame
                  key={artwork}
                  artwork={artwork}
                  index={index}
                  progress={sceneProgress}
                  mobile={!!mobile}
                />
              ))}
              <FinaleFrame
                index={5}
                progress={sceneProgress}
                mobile={!!mobile}
              />
            </div>
          )}
          <div className="walk-grid" aria-hidden="true" />
          <header className="walk-header">
            <div>
              <p className="walk-eyebrow">BEHIND THE PAPER / KAH SHIN</p>
              <h2>
                Always moving.
                <br />
                <em>Always curious.</em>
              </h2>
            </div>
          </header>
          {reduced ? (
            <PosterBackdrop progress={sceneProgress} />
          ) : (
            <div className="walk-gallery">
              {interests.map((interest, index) => (
                <Portrait
                  key={interest.kind}
                  index={index}
                  progress={sceneProgress}
                  reduced={staticMode}
                  mobile={!!mobile}
                />
              ))}
            </div>
          )}
          <div
            className="walk-instruction"
            data-complete={complete || staticMode}
            aria-live="polite"
          >
            <span aria-hidden="true">↓</span>
            {staticMode
              ? "Six fields. One curious mind."
              : complete
                ? "That’s my world. Keep scrolling."
                : ready
                  ? "Scroll to walk with me"
                  : "Getting ready to walk…"}
          </div>
          <footer className="walk-footer">
            <a className="walk-skip" href="#portfolio">
              {complete || staticMode
                ? "EXPLORE MY PROJECTS"
                : "SKIP TO PROJECTS"}{" "}
              <span aria-hidden="true">↘</span>
            </a>
          </footer>
          <div className="walk-progress" aria-hidden="true">
            <motion.div style={{ scaleX: progressScale }} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
