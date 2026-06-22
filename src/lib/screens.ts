// Vahvuusseikkailu screen registry.
// Mapped 1:1 from the uploaded workbook PDF "Vahvuusportfolio lukiolaiselle"
// (75 pages). Page 30 of the PDF is blank/decorative and is skipped.

export type WorldId = "prologi" | "m1" | "m2" | "m3" | "m4" | "m5" | "m6";

export interface WorldMeta {
  id: WorldId;
  title: string;
  subtitle: string;
  emoji: string;
  start: number; // inclusive screen number
  end: number;   // inclusive screen number
  tone: "yellow" | "coral" | "mint" | "teal" | "purple";
}

// Worlds follow the workbook's own Moduulit table (PDF p2).
export const WORLDS: WorldMeta[] = [
  { id: "prologi", title: "Prologi",   subtitle: "Tervetuloa",                                       emoji: "✨", start:  1, end: 10, tone: "yellow" },
  { id: "m1",      title: "Moduuli 1", subtitle: "Omat ydinvahvuudet",                               emoji: "🌟", start: 11, end: 27, tone: "coral"  },
  { id: "m2",      title: "Moduuli 2", subtitle: "Omat vahvuudet lukiossa",                          emoji: "🎓", start: 28, end: 40, tone: "mint"   },
  { id: "m3",      title: "Moduuli 3", subtitle: "Omat vahvuudet kotona",                            emoji: "🏠", start: 41, end: 46, tone: "teal"   },
  { id: "m4",      title: "Moduuli 4", subtitle: "Omat vahvuudet vapaa-ajalla ja harrastuksissa",    emoji: "🎨", start: 47, end: 54, tone: "purple" },
  { id: "m5",      title: "Moduuli 5", subtitle: "Omat vahvuudet ystävyyssuhteissa",                 emoji: "🤝", start: 55, end: 58, tone: "coral"  },
  { id: "m6",      title: "Moduuli 6", subtitle: "Vahvuusportfolion kokoaminen",                     emoji: "🏆", start: 59, end: 70, tone: "yellow" },
];

export const TOTAL_SCREENS = 70;

export function worldForScreen(n: number): WorldMeta {
  return WORLDS.find((w) => n >= w.start && n <= w.end) ?? WORLDS[0];
}

export interface ScreenMeta {
  n: number;
  world: WorldId;
}

export const SCREENS: ScreenMeta[] = Array.from({ length: TOTAL_SCREENS }, (_, i) => {
  const n = i + 1;
  return { n, world: worldForScreen(n).id };
});
