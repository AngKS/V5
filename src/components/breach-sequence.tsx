"use client";
import { useEffect, useRef } from "react";

/** One bounded, low-resolution canvas replaces hundreds of animated text nodes. */
function MatrixSurge() {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    const ctx = element?.getContext("2d", { alpha: true });
    if (!element || !ctx) return;
    let frame = 0,
      last = 0,
      width = 0,
      height = 0;
    let streams: { x: number; y: number; speed: number; glyphs: string[] }[] =
      [];
    const chars = "0101アイウエオカキクケコサシスセソ<>/{}";
    const resize = () => {
      width = Math.min(window.innerWidth, 1280);
      height = Math.min(window.innerHeight, 1000);
      element.width = width;
      element.height = height;
      streams = Array.from({ length: Math.ceil(width / 19) }, (_, i) => ({
        x: i * 19,
        y: Math.random() * (height + 250),
        speed: 130 + Math.random() * 220,
        glyphs: Array.from(
          { length: 18 },
          () => chars[Math.floor(Math.random() * chars.length)],
        ),
      }));
    };
    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (document.hidden) {
        last = now;
        return;
      }
      if (now - last < 40) return;
      const delta = Math.min((now - last) / 1000, 0.08);
      last = now;
      ctx.clearRect(0, 0, width, height);
      ctx.font = "14px monospace";
      for (const stream of streams) {
        stream.y = (stream.y + stream.speed * delta) % (height + 320);
        for (let j = 17; j >= 0; j--) {
          ctx.globalAlpha = (1 - j / 18) * 0.8;
          ctx.fillStyle =
            j === 0 ? "#edffff" : stream.x % 7 === 0 ? "#e88fff" : "#55e8fa";
          ctx.fillText(stream.glyphs[j], stream.x, stream.y - j * 18);
        }
      }
      ctx.globalAlpha = 1;
    };
    resize();
    frame = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return <canvas ref={canvas} className="breach-matrix-canvas" />;
}

export function BreachSequence() {
  return (
    <div className="breach-sequence">
      <MatrixSurge />
      <div className="breach-grid-floor" />
      <svg
        className="breach-bus"
        viewBox="0 0 1200 800"
        preserveAspectRatio="none"
      >
        <g fill="none" stroke="currentColor" strokeWidth="1.5">
          {Array.from({ length: 7 }, (_, i) => (
            <path
              key={i}
              d={`M0 ${80 + i * 24} H${140 + i * 18} L${270 + i * 18} ${240 + i * 24} H480 L600 400 L720 ${240 + i * 24} H${930 - i * 18} L${1060 - i * 18} ${80 + i * 24} H1200 M0 ${720 - i * 24} H${140 + i * 18} L${270 + i * 18} ${560 - i * 24} H480 L600 400 L720 ${560 - i * 24} H${930 - i * 18} L${1060 - i * 18} ${720 - i * 24} H1200`}
            />
          ))}
          <path d="M600 0v230m-30-230v200l30 30 30-30V0M600 800V570m-30 230V600l30-30 30 30v200" />
          {[240, 960].map((x) =>
            [200, 600].map((y) => (
              <g key={`${x}-${y}`}>
                <circle cx={x} cy={y} r="8" />
                <circle cx={x} cy={y} r="3" fill="currentColor" />
              </g>
            )),
          )}
        </g>
      </svg>
      <div className="hologram-deck">
        <div className="holo-panel holo-vision">
          <header>
            <span>01 / VISION ENGINE</span>
            <b>CV</b>
          </header>
          <svg viewBox="0 0 300 145">
            <g fill="none" stroke="currentColor">
              <rect
                x="15"
                y="15"
                width="112"
                height="112"
                strokeDasharray="5 5"
              />
              {Array.from({ length: 5 }, (_, i) => (
                <ellipse
                  key={i}
                  cx="71"
                  cy="71"
                  rx={12 + i * 9}
                  ry={9 + i * 8}
                  transform={`rotate(${i * 17} 71 71)`}
                />
              ))}
              <path d="M145 70h30m-8-8 8 8-8 8" />
              {Array.from({ length: 16 }, (_, i) => (
                <rect
                  key={i}
                  x={195 + (i % 4) * 20}
                  y={25 + Math.floor(i / 4) * 24}
                  width="14"
                  height="17"
                  fill="currentColor"
                  opacity={0.2 + (i % 5) * 0.16}
                />
              ))}
            </g>
          </svg>
          <footer>INPUT → FEATURES → EXPLANATION</footer>
        </div>
        <div className="holo-panel holo-infra">
          <header>
            <span>02 / SYSTEM TOPOLOGY</span>
            <b>SYS</b>
          </header>
          <svg viewBox="0 0 300 145">
            <g fill="none" stroke="currentColor">
              <path d="M150 30v38H50v35m100-35h100v35M150 68v35" />
              <rect x="116" y="8" width="68" height="30" />
              {[20, 120, 220].map((x) => (
                <g key={x}>
                  <rect x={x} y="103" width="60" height="30" />
                  <path d={`M${x + 9} 112h18m-18 10h35`} />
                  <circle cx={x + 48} cy="113" r="2" fill="currentColor" />
                </g>
              ))}
            </g>
          </svg>
          <footer>EDGE / COMPUTE / STORAGE</footer>
        </div>
        <div className="holo-panel holo-audio">
          <header>
            <span>03 / SIGNAL PROCESSOR</span>
            <b>WAV</b>
          </header>
          <svg viewBox="0 0 300 145">
            <g stroke="currentColor">
              {Array.from({ length: 38 }, (_, i) => {
                const h =
                  12 + Math.abs(Math.sin(i * 1.7) * Math.sin(i * 0.19)) * 90;
                return (
                  <path
                    key={i}
                    d={`M${12 + i * 7.4} ${72 - h / 2}v${h}`}
                    strokeWidth="3"
                  />
                );
              })}
            </g>
            <path
              d="M10 130h280M10 14h280"
              stroke="currentColor"
              opacity=".3"
            />
          </svg>
          <footer>ON-DEVICE / AUDIO SYNTHESIS</footer>
        </div>
        <div className="holo-panel holo-model">
          <header>
            <span>04 / MODEL GRAPH</span>
            <b>XAI</b>
          </header>
          <svg viewBox="0 0 300 145">
            <g fill="none" stroke="currentColor">
              {[35, 72, 109].flatMap((y) =>
                [25, 55, 85, 115].map((z) => (
                  <path
                    key={`${y}-${z}`}
                    d={`M35 ${y} 145 ${z} 265 ${y}`}
                    opacity=".35"
                  />
                )),
              )}
              {[35, 145, 265].flatMap((x, i) =>
                (i === 1 ? [25, 55, 85, 115] : [35, 72, 109]).map((y) => (
                  <circle
                    key={`${x}-${y}`}
                    cx={x}
                    cy={y}
                    r="7"
                    fill="#071827"
                  />
                )),
              )}
            </g>
          </svg>
          <footer>OBSERVE / REASON / UNDERSTAND</footer>
        </div>
      </div>
      <div className="breach-core">
        <svg viewBox="0 0 300 300">
          <g fill="none" stroke="currentColor">
            <circle cx="150" cy="150" r="140" strokeDasharray="40 12 4 12" />
            <circle cx="150" cy="150" r="118" opacity=".4" />
            <path d="M150 43 243 96v108l-93 53-93-53V96Z" />
            <path
              d="M150 67 222 109v82l-72 42-72-42v-82Z"
              strokeDasharray="7 5"
            />
          </g>
        </svg>
        <div>
          <span>ANGKS / AUXILIARY 05</span>
          <strong>
            ACCESS
            <br />
            UNLOCKED
          </strong>
          <i />
          <small>ENTERING THE OTHER SIDE</small>
        </div>
      </div>
      <div className="breach-scan-line" />
    </div>
  );
}
