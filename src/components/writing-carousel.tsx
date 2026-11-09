"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Article } from "@/lib/content";
import { Icon } from "./icon";
import "./writing-carousel.css";

export function WritingCarousel({ articles }: { articles: Article[] }) {
  const track = useRef<HTMLDivElement>(null);
  const id = useId();
  const [range, setRange] = useState({
    first: 0,
    last: 0,
    atEnd: articles.length <= 1,
  });

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => {
      const left = element.scrollLeft;
      const right = left + element.clientWidth;
      const cards = Array.from(element.children) as HTMLElement[];
      const first = Math.max(
        0,
        cards.findIndex(
          (card) => card.offsetLeft + card.offsetWidth / 2 > left,
        ),
      );
      const last = Math.max(
        first,
        cards.findLastIndex(
          (card) => card.offsetLeft + card.offsetWidth / 2 < right,
        ),
      );
      const atEnd = right >= element.scrollWidth - 4;
      setRange((previous) =>
        previous.first === first &&
        previous.last === last &&
        previous.atEnd === atEnd
          ? previous
          : { first, last, atEnd },
      );
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, [articles]);

  function go(direction: number) {
    const element = track.current;
    if (!element) return;
    const index = Math.max(
      0,
      Math.min(articles.length - 1, range.first + direction),
    );
    const card = element.children[index] as HTMLElement | undefined;
    if (card)
      element.scrollTo({
        left: card.offsetLeft,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
  }

  return (
    <div
      className="writing-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Latest Medium stories"
    >
      <div className="writing-toolbar">
        <span className="eyebrow">THE LATEST DISPATCHES / MEDIUM</span>
        <span
          className="writing-count"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {range.first + 1}
          {range.last > range.first ? `–${range.last + 1}` : ""} /{" "}
          {articles.length} stories
        </span>
      </div>
      <div
        className="writing-track"
        id={id}
        ref={track}
        tabIndex={0}
        aria-label="Scroll through stories with the arrow keys"
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            go(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
      >
        {articles.map((article, index) => (
          <article
            className="writing-card"
            key={article.url}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${articles.length}`}
          >
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${article.title} — read on Medium (opens in a new tab)`}
            >
              <div className="writing-cover">
                <span className="writing-cover-fallback" aria-hidden="true">
                  FIELD
                  <br />
                  NOTES<span>Ideas in the making.</span>
                </span>
                {article.cover && (
                  // Feed images can live on different CDNs; load directly without a server image proxy.
                  <img
                    src={article.cover}
                    alt=""
                    width={720}
                    height={450}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    ref={(image) => {
                      // An image can fail before React hydrates and attaches onError.
                      if (image?.complete && image.naturalWidth === 0)
                        image.hidden = true;
                    }}
                    onError={(event) => {
                      event.currentTarget.hidden = true;
                    }}
                  />
                )}
                <span className="writing-issue" aria-hidden="true">
                  NO. {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="writing-card-body">
                <span className="eyebrow">{article.date} / MEDIUM</span>
                <h3>{article.title}</h3>
                <p>{article.excerpt || "Read the full story on Medium."}</p>
                <span className="writing-read">
                  READ ON MEDIUM <Icon name="arrow-up-right" />
                </span>
              </div>
            </a>
          </article>
        ))}
      </div>
      <div className="writing-navigation">
        <p>Fresh thoughts. Straight from the notebook.</p>
        <div className="writing-arrows">
          <button
            type="button"
            aria-label="Previous story"
            aria-controls={id}
            disabled={range.first === 0}
            onClick={() => go(-1)}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next story"
            aria-controls={id}
            disabled={range.atEnd}
            onClick={() => go(1)}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}
