export function PanelLoader({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`panel-loader${compact ? " compact" : ""}`}>
      <svg viewBox="0 0 220 130" aria-hidden="true">
        <path
          className="worker-road"
          d="M15 115h190"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="9 9"
        />
        <g
          className="comic-worker"
          fill="var(--paper)"
          stroke="var(--ink)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M70 85l-18 24m28-22 15 22" fill="none" />
          <path d="M62 58q-10 14-4 29h30l-4-29Z" />
          <circle cx="72" cy="41" r="15" />
          <path d="M53 38h37M58 35q2-19 14-18 13 0 14 18M72 18v16" />
          <path d="M68 58l22 13 19-18M81 58l16 5" fill="none" />
          <g transform="rotate(8 133 50)">
            <rect x="102" y="20" width="65" height="66" fill="var(--accent)" />
            <path
              d="M110 29h49v20h-49zm0 27h20v22h-20zm27 0h22v22h-22z"
              stroke="var(--paper)"
              strokeWidth="2"
              fill="none"
            />
          </g>
        </g>
        <path
          d="M22 63h20M15 76h25M28 89h13"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
      <span>
        Fetching the next panel
        <span className="worker-ellipsis" aria-hidden="true">
          …
        </span>
      </span>
    </div>
  );
}
