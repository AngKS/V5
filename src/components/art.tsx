export function ComicArt({ kind = "hero" }: { kind?: string }) {
  return (
    <svg
      viewBox="0 0 600 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={
        kind === "hero"
          ? "Comic illustration of a curious eye looking out from a computer"
          : `${kind} comic illustration`
      }
    >
      <defs>
        <pattern
          id={`dots-${kind}`}
          width="9"
          height="9"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1.3" fill="currentColor" />
        </pattern>
      </defs>
      <path
        d="M35 358 564 358M65 55l54 37M505 65l-48 43M302 25v54M28 175l71 12M515 211l60-7"
        stroke="currentColor"
        strokeWidth="4"
      />
      {kind === "sound" ? (
        <>
          <circle
            cx="300"
            cy="200"
            r="120"
            fill={`url(#dots-${kind})`}
            stroke="currentColor"
            strokeWidth="4"
          />
          <rect
            x="256"
            y="90"
            width="88"
            height="170"
            rx="44"
            fill="var(--paper)"
            stroke="currentColor"
            strokeWidth="7"
          />
          <path
            d="M224 199v20a76 76 0 0 0 152 0v-20M300 295v46m-45 0h90M163 150q-45 50 0 100m274-100q45 50 0 100"
            stroke="currentColor"
            strokeWidth="7"
          />
        </>
      ) : kind === "system" ? (
        <>
          <path d="M170 150h260v155H170z" fill={`url(#dots-${kind})`} />
          {[85, 165, 245].map((y) => (
            <g key={y}>
              <rect
                x="190"
                y={y}
                width="220"
                height="60"
                fill="var(--paper)"
                stroke="currentColor"
                strokeWidth="5"
              />
              <circle cx="220" cy={y + 30} r="7" fill="currentColor" />
              <path
                d={`M260 ${y + 30}h120`}
                stroke="currentColor"
                strokeWidth="4"
              />
            </g>
          ))}
          <path
            d="M190 195H95v120h70m245-120h95V95h-40"
            stroke="currentColor"
            strokeWidth="5"
          />
        </>
      ) : (
        <>
          <path
            d="m139 101 311-20 24 220-316 20z"
            fill={`url(#dots-${kind})`}
            stroke="currentColor"
            strokeWidth="5"
          />
          <path
            d="m156 113 274-17 18 182-276 18z"
            fill="var(--paper)"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            d="M191 197q100-136 220-7-101 122-220 7Z"
            fill="white"
            stroke="currentColor"
            strokeWidth="6"
          />
          <ellipse cx="303" cy="193" rx="43" ry="58" fill="currentColor" />
          <ellipse cx="317" cy="172" rx="12" ry="17" fill="var(--paper)" />
          <path
            d="m157 322-55 32 408-21-36-32M251 331l112-7"
            stroke="currentColor"
            strokeWidth="6"
          />
          <path
            d="m211 142-13-23m45 5-5-25m116 23 13-24m20 48 24-20"
            stroke="currentColor"
            strokeWidth="4"
          />
        </>
      )}
      <path
        d="m478 34 8 20 22 2-17 14 5 22-19-12-19 12 5-22-17-14 22-2z"
        fill="currentColor"
      />
    </svg>
  );
}
