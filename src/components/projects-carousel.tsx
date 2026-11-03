"use client";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import type { ProjectPage } from "@/lib/projects";

export function ProjectsCarousel() {
  const region = useRef<HTMLDivElement>(null);
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
          setError(reason.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [visible, page, pageSize, retry]);
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;
  function go(next: number) {
    if (loading || next < 0 || next >= totalPages || next === page) return;
    setDirection(next > page ? 1 : -1);
    setPage(next);
  }
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
      <div className="repo-toolbar">
        <span className="eyebrow">SORTED BY STARS, THEN LATEST COMMIT</span>
        <span className="eyebrow">
          {data ? `${data.total} PUBLIC PROJECTS` : "FROM GITHUB"}
        </span>
      </div>
      <div
        className="repo-window"
        aria-busy={loading}
        onTouchStart={(event) => {
          touch.current = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY,
          };
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
              TRY AGAIN ↻
            </button>
          </div>
        ) : loading ? (
          <div className="repo-cards" aria-label="Loading projects">
            {Array.from({ length: pageSize }, (_, index) => (
              <div key={index} className="repo-skeleton" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            ))}
          </div>
        ) : data?.total === 0 ? (
          <div className="repo-message">No public projects to show yet.</div>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${pageSize}:${data?.page}`}
              className="repo-cards"
              initial={{ opacity: 0, x: reduced ? 0 : direction * 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: reduced ? 0 : -direction * 20 }}
              transition={{ duration: reduced ? 0 : 0.22, ease: "easeOut" }}
            >
              {data?.items.map((project, index) => (
                <article
                  className="repo-card"
                  key={project.repo}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${data.page * pageSize + index + 1} of ${data.total}: ${project.repo}`}
                >
                  <div className="repo-card-top">
                    <span className="repo-rank">
                      {String(data.page * pageSize + index + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>
                    <span
                      className="repo-stars"
                      aria-label={`${project.stars} stars`}
                    >
                      ✩ {project.stars.toLocaleString("en-US")}
                    </span>
                  </div>
                  <div className="repo-symbol" aria-hidden="true">
                    {project.language === "Python" ||
                    project.language === "Jupyter Notebook"
                      ? "✳"
                      : "{ / }"}
                  </div>
                  <div className="repo-details">
                    <span className="eyebrow">
                      {project.language || "OPEN SOURCE"}
                    </span>
                    <h3>
                      <a href={project.url} target="_blank" rel="noreferrer">
                        {project.repo.replaceAll("_", " ").replaceAll("-", " ")}
                      </a>
                    </h3>
                    <p>{project.description}</p>
                    <div className="repo-card-bottom">
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
                        VIEW CODE ↗
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
          ← <span>PREVIOUS</span>
        </button>
        <div className="repo-page-status">
          <span role="status" aria-live="polite">
            {loading
              ? "Loading projects…"
              : error
                ? "Unable to load page"
                : totalPages
                  ? `Page ${page + 1} of ${totalPages}`
                  : "No projects"}
          </span>
          {totalPages > 1 && (
            <select
              aria-label="Go to project page"
              value={page}
              disabled={loading}
              onChange={(event) => go(Number(event.target.value))}
            >
              {Array.from({ length: totalPages }, (_, index) => (
                <option key={index} value={index}>
                  Page {index + 1}
                </option>
              ))}
            </select>
          )}
        </div>
        <button
          onClick={() => go(page + 1)}
          disabled={loading || !totalPages || page >= totalPages - 1}
          aria-label="Next projects"
        >
          <span>NEXT</span> →
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
