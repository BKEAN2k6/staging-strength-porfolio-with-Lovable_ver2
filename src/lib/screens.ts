// Vahvuusseikkailu screen registry — skeleton.
// Detailed screen components are wired in later batches (Maailma 1–6, Aarre).
// Total: 76 numbered screens grouped into Prologi + 6 Maailmaa + Aarre.

export type WorldId = "prologi" | "m1" | "m2" | "m3" | "m4" | "m5" | "m6" | "aarre";

export interface WorldMeta {
  id: WorldId;
  title: string;
  subtitle: string;
  emoji: string;
  start: number; // inclusive
  end: number;   // inclusive
  tone: "yellow" | "coral" | "mint" | "teal" | "purple";
}

export const WORLDS: WorldMeta[] = [
  { id: "prologi", title: "Prologi",   subtitle: "Tervetuloa seikkailuun", emoji: "✨", start: 1,  end: 10, tone: "yellow" },
  { id: "m1",      title: "Maailma 1", subtitle: "Vahvuuksien maa",         emoji: "🌟", start: 11, end: 33, tone: "coral" },
  { id: "m2",      title: "Maailma 2", subtitle: "Vahvuuskarkit",           emoji: "🍬", start: 34, end: 43, tone: "mint" },
  { id: "m3",      title: "Maailma 3", subtitle: "Toisten silmin",          emoji: "👀", start: 44, end: 53, tone: "teal" },
  { id: "m4",      title: "Maailma 4", subtitle: "Sydämeni asiat",          emoji: "💛", start: 54, end: 60, tone: "purple" },
  { id: "m5",      title: "Maailma 5", subtitle: "Ystävän vahvuudet",       emoji: "🤝", start: 61, end: 67, tone: "coral" },
  { id: "m6",      title: "Maailma 6", subtitle: "Reflektio",               emoji: "🪞", start: 68, end: 72, tone: "mint" },
  { id: "aarre",   title: "Aarre",     subtitle: "Portfolio",                emoji: "🏆", start: 73, end: 76, tone: "yellow" },
];

export const TOTAL_SCREENS = 76;

export function worldForScreen(n: number): WorldMeta {
  return WORLDS.find((w) => n >= w.start && n <= w.end) ?? WORLDS[0];
}

export interface ScreenMeta {
  n: number;
  world: WorldId;
  // Long-form Finnish copy / illustration captions are stubbed; replaced per batch.
  todo?: true;
}

export const SCREENS: ScreenMeta[] = Array.from({ length: TOTAL_SCREENS }, (_, i) => {
  const n = i + 1;
  return { n, world: worldForScreen(n).id, todo: true };
});