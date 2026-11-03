"use client";
import { useEffect, useRef } from "react";

const CHARACTERS = "01アイウエオカキクケコサシスセソ<>/{}";

export function SectionRain() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    const section = element?.parentElement;
    const ctx = element?.getContext("2d");
    if (!element || !section || !ctx) return;
    let width = 0,
      height = 0,
      frame = 0,
      last = 0,
      visible = false;
    let drops: number[] = [];
    const resize = () => {
      width = section.clientWidth;
      height = section.clientHeight;
      element.width = width;
      element.height = height;
      drops = Array.from(
        { length: Math.ceil(width / 28) },
        () => (Math.random() * height) / 20,
      );
    };
    const paint = (now: number) => {
      frame = requestAnimationFrame(paint);
      if (now - last < 85) return;
      last = now;
      // Fade to transparency so section colours remain intact.
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,.13)";
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
      ctx.font = "13px monospace";
      drops.forEach((y, i) => {
        ctx.fillStyle = i % 7 === 0 ? "#ed73ff" : "#55e8fa";
        ctx.fillText(
          CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)],
          i * 28,
          y * 20,
        );
        drops[i] = y * 20 > height && Math.random() > 0.96 ? 0 : y + 0.6;
      });
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      if (visible && !document.hidden) frame = requestAnimationFrame(paint);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    const sizing = new ResizeObserver(resize);
    resize();
    sizing.observe(section);
    observer.observe(section);
    document.addEventListener("visibilitychange", sync);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      sizing.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);
  return <canvas className="matrix-rain" ref={canvas} aria-hidden="true" />;
}
