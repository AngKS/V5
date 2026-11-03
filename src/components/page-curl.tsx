import "./page-curl.css";
import { useId } from "react";

export function PageCurl({
  corner = "top-left",
}: {
  corner?: "top-left" | "bottom-right";
}) {
  const paperGradient = useId();

  return (
    <span
      className={`page-curl-art page-curl-art--${corner}`}
      aria-hidden="true"
    >
      <span className="page-curl-underlay">
        <span className="page-curl-comic" />
      </span>
      <svg className="page-curl-fold" viewBox="0 0 80 80" fill="none">
        <defs>
          <linearGradient
            id={paperGradient}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="46%" stopColor="#b7b1a2" />
            <stop offset="55%" stopColor="#e6dfce" />
            <stop offset="72%" stopColor="#fffdf5" />
            <stop offset="100%" stopColor="#eee8da" />
          </linearGradient>
        </defs>
        <path
          d="M0 80 80 0C78 26 72 48 59 60 43 72 22 78 0 80Z"
          fill={`url(#${paperGradient})`}
        />
        <path d="M1 79 79 1" stroke="#817d703d" strokeWidth="0.75" />
      </svg>
    </span>
  );
}
