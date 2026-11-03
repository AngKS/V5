const paths = {
  "arrow-up-right": "M5 19 19 5M5 5h14v14",
  "arrow-down": "M12 4v16m-7-7 7 7 7-7",
  starburst: "M12 2v20M2 12h20M5 5l14 14M5 19 19 5",
  enter: "M20 4v9H4m6-6-6 6 6 6",
  close: "m6 6 12 12M6 18 18 6",
  plus: "M12 5v14M5 12h14",
  minus: "M5 12h14",
  breach: "m12 2 10 10-10 10L2 12Zm0 6 4 4-4 4-4-4Z",
  terminal: "m4 6 6 6-6 6m9 0h7",
  engine: "m7 6-5 6 5 6m10-12 5 6-5 6m-3-15-4 18",
  lost: "M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4m0 4h.01",
  branch: "M5 3v10h14m-5-5 5 5-5 5",
} as const;

/** Decorative glyphs: visible labels carry the accessible name. */
export function Icon({ name }: { name: keyof typeof paths }) {
  return (
    <svg
      className="glyph"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}
