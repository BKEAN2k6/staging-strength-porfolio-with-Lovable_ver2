import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { StickyNote } from "@/components/StickyNote";
import { Button } from "@/components/ui/button";
import { useAchievements, type Achievement } from "@/hooks/useAchievements";
import { celebrateSave } from "@/lib/celebrate";
import { useTr } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/student/achievements")({
  component: StudentAchievementsPage,
  head: () => ({
    meta: [
      { title: "Saavutukset — Vahvuusseikkailu" },
      { name: "description", content: "Kerää palkintoja ja seuraa edistymistäsi vahvuusseikkailussa." },
      { property: "og:title", content: "Saavutukset — Vahvuusseikkailu" },
      { property: "og:description", content: "Kerää palkintoja ja seuraa edistymistäsi vahvuusseikkailussa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const SEEN_KEY = "vs.achievements.seen";

function readSeen(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SEEN_KEY);
    const arr = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(arr) ? (arr as string[]) : [];
  } catch {
    return [];
  }
}

function StudentAchievementsPage() {
  const tr = useTr();
  const { achievements, unlockedCount, total, loading } = useAchievements();
  const [fresh, setFresh] = useState<Achievement[]>([]);

  useEffect(() => {
    if (loading) return;
    const seen = new Set(readSeen());
    const unlocked = achievements.filter((a) => a.unlocked);
    const isFirstVisit = seen.size === 0;
    const newly = unlocked.filter((a) => !seen.has(a.id));
    try {
      window.localStorage.setItem(SEEN_KEY, JSON.stringify(unlocked.map((a) => a.id)));
    } catch {
      /* ignore storage failures */
    }
    if (!isFirstVisit && newly.length > 0) {
      setFresh(newly);
      void celebrateSave(null);
    }
  }, [loading, achievements]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-display text-3xl">{tr("Saavutukset")} 🏆</h1>
        <span className="rounded-full bg-[color:var(--purple)] px-4 py-1 font-bold text-white">
          {unlockedCount}/{total}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a) => (
          <StickyNote
            key={a.id}
            seed={`ach-${a.id}`}
            className={a.unlocked ? "space-y-2" : "space-y-2 opacity-60 grayscale"}
          >
            <div className="text-3xl" aria-hidden>
              {a.unlocked ? a.emoji : "🔒"}
            </div>
            <div className="font-display text-lg">
              {tr(a.title)}
              {a.titleSuffix ? ` ${a.titleSuffix}` : ""}
            </div>
            <p className="text-sm opacity-80">{tr(a.description)}</p>
            {a.progressLabel && !a.unlocked && (
              <>
                <div className="h-2 w-full overflow-hidden rounded-full bg-black/10">
                  <div
                    className="h-full rounded-full bg-[color:var(--coral)]"
                    style={{ width: `${Math.round(a.progress * 100)}%` }}
                  />
                </div>
                <div className="text-xs opacity-70">{a.progressLabel}</div>
              </>
            )}
            {a.unlocked && (
              <div className="text-xs font-bold uppercase tracking-wider text-[color:var(--purple)]">
                {tr("Avattu")}
              </div>
            )}
          </StickyNote>
        ))}
      </div>

      {fresh.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[color:var(--purple-dark)] p-6 text-center text-foreground shadow-2xl">
            <div className="text-5xl" aria-hidden>
              {fresh[0].emoji}
            </div>
            <h2 className="mt-3 font-display text-2xl">{tr("Uusi saavutus!")} ✨</h2>
            <p className="mt-2 font-bold">
              {tr(fresh[0].title)}
              {fresh[0].titleSuffix ? ` ${fresh[0].titleSuffix}` : ""}
            </p>
            <p className="mt-1 text-sm opacity-80">{tr(fresh[0].description)}</p>
            {fresh.length > 1 && (
              <p className="mt-2 text-xs opacity-70">
                +{fresh.length - 1} {tr("muuta saavutusta")}
              </p>
            )}
            <Button
              onClick={() => setFresh([])}
              className="mt-4 rounded-full bg-[color:var(--yellow)] font-bold text-[color:var(--ink)] hover:bg-[color:var(--yellow)]/90"
            >
              {tr("Hienoa!")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
