import { useId } from "react";

/** Shared neon ink treatment for the panda stencils. */
export function CyberPanda({ variant = "vr" }: { variant?: "vr" | "laptop" }) {
  const id = useId().replaceAll(":", "");
  return (
    <div className={`cyber-panda cyber-panda-${variant}`} aria-hidden="true">
      <svg viewBox="0 0 440 560" fill="none" focusable="false">
        <defs>
          <linearGradient
            id={`${id}-ink`}
            x1="60"
            y1="40"
            x2="390"
            y2="500"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="var(--panda-neon-green)" />
            <stop offset=".5" stopColor="var(--panda-neon-cyan)" />
            <stop offset="1" stopColor="var(--panda-neon-blue)" />
          </linearGradient>
          <clipPath id={`${id}-slice`}>
            <path d="M0 135h440v26H0zm0 106h440v15H0zm0 148h440v20H0z" />
          </clipPath>
          <g id={`${id}-stencil`} strokeLinecap="round" strokeLinejoin="round">
            {variant === "laptop" ? (
              <>
                {/* Round head, soft eye patches and seated hoodie from the reference. */}
                <path d="M105 110Q67 79 89 49q27-31 59 5M302 72q39-36 66-6 24 29-4 57" />
                <path d="M91 156Q87 79 155 58q93-31 161 22 57 43 48 120-6 69-67 94-82 30-152-16-56-37-54-122Z" />
                <ellipse
                  cx="167"
                  cy="164"
                  rx="31"
                  ry="40"
                  transform="rotate(24 167 164)"
                />
                <ellipse
                  cx="276"
                  cy="178"
                  rx="31"
                  ry="40"
                  transform="rotate(-22 276 178)"
                />
                <circle cx="174" cy="158" r="9" />
                <circle cx="277" cy="172" r="9" />
                <path d="M208 190q15-9 27 2-5 17-16 13-9-4-11-15Zm12 16v12m0 0q-10 25-27 4m27-4q13 23 28 4" />
                <path d="M95 220q-32-3-34 28l-7 26q-2 15 16 23M91 274q-29 11-37 50-25 79 5 114 15 18 65 11M82 318q-20 79 35 128 47 42 135 22M99 286q68 47 157 35M191 323v38m30-35v38" />
                <circle cx="191" cy="365" r="4" />
                <circle cx="221" cy="368" r="4" />
                <path d="M131 352q17 35 46 42l63 4M131 448q-16-35 3-61" />
                {/* A tilted laptop and the paw resting around its lower corner. */}
                <path d="m251 293 107 1q10 0 7 12l-26 151q-1 10-12 10h-82m-4-68 17-96q2-10 12-10" />
                <path d="M222 402q24-15 45 5 25 27 5 48-13 15-50 16-19-35 0-69Z" />
                <path
                  d="m286 359-9 9 7 9m26-17 9 9-12 10m-9-24-6 28"
                  strokeWidth="3"
                />
                <path d="M59 438q22 9 36 1" />
              </>
            ) : (
              <>
                {/* Hood, ears and round face preserve the reference's silhouette. */}
                <path d="M80 126Q67 78 110 67L144 78M323 87q51-7 49 44l-16 27" />
                <path d="M76 151Q67 72 146 43q109-42 184 37 71 79 34 185l-29 45M83 159Q85 89 159 78q98-20 149 55M82 242q8 54 62 74" />
                <path d="M86 211q-6 70 63 103 74 31 137-2 62-33 61-101l-9-50q-2-14-21-29" />
                {/* Chunky headset with three vertical sensor windows. */}
                <path d="M73 137q100-18 204 7 34 8 36 52 1 42-29 51-109 21-211-3-35-9-33-53 1-43 33-54Z" />
                <path d="m76 136 19-22q100-15 198 16l34 32-33-8m17 58 34-7-7 25-36 8" />
                {[112, 173, 234].map((x) => (
                  <rect key={x} x={x} y="174" width="20" height="39" rx="10" />
                ))}
                <path d="M192 268q16-15 32 0" />
                {/* Oversized hoodie, drawstrings and tucked-in paws. */}
                <path d="M114 296q-42 20-51 77-14 56 25 78l12-4m228-153q38 8 46 47 23 62-12 96l-33 20-28-24M102 345q-19 34-1 51m207-51q14 34-7 51l6 32M97 401l-6 68q128 43 259-3l-3-34M113 311q96 39 204-1M174 335l-6 36m46-30 4 31" />
                <circle cx="168" cy="374" r="4" />
                <circle cx="218" cy="375" r="4" />
                <path d="M135 451q78 20 155-2" strokeWidth="2" />
              </>
            )}
          </g>
        </defs>
        <g className="panda-spray" fill={`url(#${id}-ink)`}>
          {Array.from({ length: 62 }, (_, i) => {
            const side = i % 2;
            return (
              <circle
                key={i}
                cx={side ? 355 + ((i * 13) % 53) : 25 + ((i * 17) % 62)}
                cy={55 + ((i * 43) % 430)}
                r={0.6 + (i % 4) * 0.5}
                opacity={0.2 + (i % 5) * 0.13}
              />
            );
          })}
        </g>
        <g className="panda-stencil-fills">
          {variant === "laptop" ? (
            <>
              <path
                className="panda-fill-dark"
                d="M105 110Q67 79 89 49q27-31 59 5ZM302 72q39-36 66-6 24 29-4 57Z"
              />
              <path
                className="panda-fill-hood"
                d="M95 220q-32-3-34 28l-7 26 16 23q-27 70-16 124 8 35 70 28 47 42 135 22l58-176Z"
              />
              <path
                className="panda-fill-face"
                d="M91 156Q87 79 155 58q93-31 161 22 57 43 48 120-6 69-67 94-82 30-152-16-56-37-54-122Z"
              />
              <ellipse
                className="panda-fill-dark"
                cx="167"
                cy="164"
                rx="31"
                ry="40"
                transform="rotate(24 167 164)"
              />
              <ellipse
                className="panda-fill-dark"
                cx="276"
                cy="178"
                rx="31"
                ry="40"
                transform="rotate(-22 276 178)"
              />
              <circle className="panda-fill-face" cx="174" cy="158" r="7" />
              <circle className="panda-fill-face" cx="277" cy="172" r="7" />
              <path
                className="panda-fill-dark"
                d="M208 190q15-9 27 2-5 17-16 13-9-4-11-15Z"
              />
              <path
                className="panda-fill-device"
                d="m258 293 100 1q10 0 7 12l-26 151q-1 10-12 10h-96Z"
              />
              <path
                className="panda-fill-dark"
                d="M222 402q24-15 45 5 25 27 5 48-13 15-50 16-19-35 0-69Z"
              />
            </>
          ) : (
            <>
              <path
                className="panda-fill-dark"
                d="M80 126Q67 78 110 67L144 78ZM323 87q51-7 49 44l-16 27Z"
              />
              <path
                className="panda-fill-hood"
                d="M76 151Q67 72 146 43q109-42 184 37 71 79 34 185l-29 45q38 8 46 47 23 62-12 96l-22 16 3 15q-131 46-259 3l6-68q-45-12-34-78 9-57 51-77Z"
              />
              <path
                className="panda-fill-face"
                d="M86 211q-6 70 63 103 74 31 137-2 62-33 61-101l-9-50q-2-14-21-29-51-54-149-34-74 11-82 113Z"
              />
              <path
                className="panda-fill-device"
                d="M73 137q100-18 204 7 34 8 36 52 1 42-29 51-109 21-211-3-35-9-33-53 1-43 33-54Z"
              />
              {[112, 173, 234].map((x) => (
                <rect
                  className="panda-fill-dark"
                  key={x}
                  x={x}
                  y="174"
                  width="20"
                  height="39"
                  rx="10"
                />
              ))}
            </>
          )}
        </g>
        <g stroke={`url(#${id}-ink)`} strokeWidth="5">
          <use href={`#${id}-stencil`} className="panda-stencil" />
          <g className="panda-paint-drips">
            <path d="M95 456v52m19-43v24m56-8v54m18-50v16m51-13v34m74-43v62m19-69v29" />
            <path
              d={
                variant === "laptop"
                  ? "M70 324v34M339 451v54m-17-33v19"
                  : "M53 225v47m10-36v16M347 258v38"
              }
              strokeWidth="3"
            />
          </g>
        </g>
        <use
          href={`#${id}-stencil`}
          className="panda-glitch-channel"
          stroke="var(--panda-neon-green)"
          strokeWidth="3"
          clipPath={`url(#${id}-slice)`}
        />
      </svg>
    </div>
  );
}
