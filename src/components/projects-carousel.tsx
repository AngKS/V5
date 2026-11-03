"use client";
import "./projects-carousel.css";
import { PanelLoader } from "./panel-loader";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import type { ProjectPage } from "@/lib/projects";

export function ProjectsCarousel() {
  const region = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const navigating = useRef(false);
  const wheel = useRef({ last: 0, distance: 0, fired: false });
  const visible = useInView(region, { once: true, margin: "200px" });
  const reduced = useReducedMotion();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(3);
  const [data, setData] = useState<ProjectPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [direction, setDirection] = useState(1);
  const cache = useRef(new Map<string, ProjectPage>());
  const touch = useRef<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const media = matchMedia("(max-width: 700px)");
    const resize = () => {
      navigating.current = false;
      setPageSize(media.matches ? 1 : 3);
      setPage(0);
    };
    resize();
    media.addEventListener("change", resize);
    return () => media.removeEventListener("change", resize);
  }, []);
  useEffect(() => {
    if (!visible) return;
    const key = `${pageSize}:${page}`;
    const cached = cache.current.get(key);
    setError("");
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/projects?page=${page}&pageSize=${pageSize}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok)
          throw new Error("Couldn’t load these projects. Give it another try.");
        return response.json() as Promise<ProjectPage>;
      })
      .then((result) => {
        if (!controller.signal.aborted) {
          cache.current.set(key, result);
          setData(result);
          setLoading(false);
        }
      })
      .catch((reason) => {
        if (!controller.signal.aborted) {
          navigating.current = false;
          setError(reason.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [visible, page, pageSize, retry]);
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;
  const go = useCallback(
    (next: number) => {
      if (
        loading ||
        navigating.current ||
        next < 0 ||
        next >= totalPages ||
        next === page
      )
        return;
      navigating.current = true;
      setDirection(next > page ? 1 : -1);
      setPage(next);
    },
    [loading, totalPages, page],
  );
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      // Trackpads emit wheel events. Leave vertical scrolling and pinch zoom alone.
      if (
        event.ctrlKey ||
        Math.abs(event.deltaX) <= Math.abs(event.deltaY) * 1.5
      )
        return;
      const now = performance.now();
      const burst = wheel.current;
      if (now - burst.last > 220) {
        burst.distance = 0;
        burst.fired = false;
      }
      burst.last = now;
      const next = page + (event.deltaX > 0 ? 1 : -1);
      if (burst.fired) {
        event.preventDefault();
        return;
      }
      if (next < 0 || next >= totalPages || loading || navigating.current)
        return;
      event.preventDefault();
      const scale =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? element.clientWidth
            : 1;
      burst.distance += event.deltaX * scale;
      if (Math.abs(burst.distance) >= 55) {
        burst.fired = true;
        go(page + (burst.distance > 0 ? 1 : -1));
      }
    };
    element.addEventListener("wheel", onWheel, { passive: false });
    return () => element.removeEventListener("wheel", onWheel);
  }, [go, loading, page, totalPages]);
  const slide = {
    enter: (direction: number) => ({
      opacity: reduced ? 1 : 0,
      x: reduced ? 0 : direction * 90,
    }),
    visible: { opacity: 1, x: 0 },
    exit: (direction: number) => ({
      opacity: reduced ? 1 : 0,
      x: reduced ? 0 : -direction * 90,
    }),
  };
  return (
    <div
      ref={region}
      className="repo-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="GitHub projects"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "ArrowRight") {
          event.preventDefault();
          go(page + 1);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          go(page - 1);
        }
      }}
    >
      <noscript>
        <p>
          Browse all projects on{" "}
          <a href="https://github.com/AngKS?tab=repositories">GitHub</a>.
        </p>
      </noscript>
      <div className="repo-toolbar">
        <span className="repo-label">Stars first, latest commits next</span>
        <span className="repo-label">
          {data ? `${data.total} public projects` : "From GitHub"}
        </span>
      </div>
      <div
        ref={viewport}
        className="repo-window"
        aria-busy={loading}
        onTouchStart={(event) => {
          if (event.touches.length !== 1) {
            touch.current = null;
            return;
          }
          touch.current = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
          };
        }}
        onTouchCancel={() => {
          touch.current = null;
        }}
        onTouchEnd={(event) => {
          if (!touch.current) return;
          const dx = event.changedTouches[0].clientX - touch.current.x;
          const dy = event.changedTouches[0].clientY - touch.current.y;
          touch.current = null;
          if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5)
            go(page + (dx < 0 ? 1 : -1));
        }}
      >
        {error ? (
          <div className="repo-message" role="alert">
            <p>{error}</p>
            <button onClick={() => setRetry((value) => value + 1)}>
              Try again
            </button>
          </div>
        ) : loading && !data ? (
          <div role="status">
            <PanelLoader />
          </div>
        ) : data?.total === 0 ? (
          <div className="repo-message">No public projects to show yet.</div>
        ) : (
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={`${data?.pageSize}:${data?.page}`}
              className="repo-cards"
              custom={direction}
              variants={slide}
              initial="enter"
              animate="visible"
              exit="exit"
              onAnimationComplete={(definition) => {
                if (definition === "visible") navigating.current = false;
              }}
              transition={{ duration: reduced ? 0 : 0.22, ease: "easeOut" }}
            >
              {data?.items.map((project, index) => (
                <article
                  className="repo-card"
                  key={project.repo}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${data.page * data.pageSize + index + 1} of ${data.total}: ${project.repo}`}
                >
                  <div className="repo-card-top">
                    <span className="repo-rank">
                      {String(data.page * data.pageSize + index + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>
                    <span
                      className="repo-stars"
                      aria-label={`${project.stars} stars`}
                    >
                      {project.stars.toLocaleString("en-US")} stars
                    </span>
                  </div>
                  <div className="repo-details">
                    <h3>
                      <a href={project.url} target="_blank" rel="noreferrer">
                        {project.repo.replaceAll("_", " ").replaceAll("-", " ")}
                      </a>
                    </h3>
                    <p>{project.description}</p>
                    <div className="repo-card-bottom">
                      <span className="repo-label">
                        {project.language || "Open source"}
                      </span>
                      <span>
                        {project.activity
                          ? `${project.activitySource === "commit" ? "Committed" : "Pushed"} ${new Date(project.activity).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}`
                          : "Date unavailable"}
                      </span>
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`View ${project.repo} on GitHub`}
                      >
                        View repository
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
      <div className="repo-pagination">
        <button
          onClick={() => go(page - 1)}
          disabled={loading || page === 0}
          aria-label="Previous projects"
        >
          <span>Previous</span>
        </button>
        <div className="repo-page-status">
          <div role="status" aria-live="polite">
            {loading ? (
              data ? (
                <PanelLoader compact />
              ) : (
                "Loading projects…"
              )
            ) : error ? (
              "Unable to load page"
            ) : totalPages ? (
              `Page ${page + 1} of ${totalPages}`
            ) : (
              "No projects"
            )}
          </div>
        </div>
        <button
          onClick={() => go(page + 1)}
          disabled={loading || !totalPages || page >= totalPages - 1}
          aria-label="Next projects"
        >
          <span>Next</span>
        </button>
      </div>
      {data?.approximate && (
        <p className="repo-note">
          Some commit dates are unavailable; latest push dates are used for
          those repositories.
        </p>
      )}
    </div>
  );
}
