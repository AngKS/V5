export const STAMPS = [
  {
    id: "terminal",
    name: "Below the fold",
    symbol: ">_",
    description: "Found the hidden terminal.",
  },
  {
    id: "breach",
    name: "Other side",
    symbol: "◈",
    description: "Entered breach mode.",
  },
  {
    id: "engine",
    name: "Under the hood",
    symbol: "</>",
    description: "Visited the engine room.",
  },
  {
    id: "lost",
    name: "Object not detected",
    symbol: "[?]",
    description: "Discovered the 404 page.",
  },
] as const;
export type StampId = (typeof STAMPS)[number]["id"];
export const STAMP_EVENT = "v5:discovery";
export const STAMP_KEY = "v5:discovery-stamps:v1";
let sessionStamps: StampId[] = [];
export function parseStamps(value: string | null): StampId[] {
  try {
    const parsed: unknown = JSON.parse(value || "[]");
    return Array.isArray(parsed)
      ? STAMPS.filter((stamp) => parsed.includes(stamp.id)).map(
          (stamp) => stamp.id,
        )
      : [];
  } catch {
    return [];
  }
}
export function readStamps(): StampId[] {
  try {
    sessionStamps = [
      ...new Set([
        ...sessionStamps,
        ...parseStamps(localStorage.getItem(STAMP_KEY)),
      ]),
    ];
  } catch {}
  return sessionStamps;
}
export function awardStamp(id: StampId) {
  const current = readStamps();
  if (current.includes(id)) return;
  sessionStamps = [...current, id];
  try {
    localStorage.setItem(STAMP_KEY, JSON.stringify(sessionStamps));
  } catch {}
  window.dispatchEvent(new CustomEvent(STAMP_EVENT, { detail: id }));
}
