import { createFileRoute } from "@tanstack/react-router";
import { StickyNote } from "@/components/StickyNote";
import { useStrengthJar } from "@/hooks/useStrengthJar";
import { useReceivedGifts } from "@/hooks/useReceivedGifts";
import { ALL_STRENGTHS } from "@/lib/strength-jar-data";
import { getStrengthName } from "@/lib/strengths-i18n";
import { useLanguage, useTr } from "@/lib/i18n";

export const Route = createFileRoute("/_authenticated/student/strengths")({
  component: StudentStrengthsPage,
  head: () => ({
    meta: [
      { title: "Vahvuuteni — Vahvuusseikkailu" },
      { name: "description", content: "Katso valitsemasi, keräämäsi ja opettajilta saamasi vahvuudet." },
      { property: "og:title", content: "Vahvuuteni — Vahvuusseikkailu" },
      { property: "og:description", content: "Katso valitsemasi, keräämäsi ja opettajilta saamasi vahvuudet." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function StudentStrengthsPage() {
  const tr = useTr();
  const { language } = useLanguage();
  const lang = language === "sv" ? "sv" : language === "en" ? "en" : "fi";
  const { selected, collected } = useStrengthJar();
  const { gifts } = useReceivedGifts();

  const receivedIds = new Set(
    gifts.map((g) => Number(g.strength_id)).filter((n) => Number.isFinite(n)),
  );
  const collectedIds = new Set<number>([...selected, ...collected]);
  const owned = new Set<number>([...collectedIds, ...receivedIds]);
  const pct = Math.round((owned.size / ALL_STRENGTHS.length) * 100);

  function Pills({ ids, empty }: { ids: number[]; empty: string }) {
    if (ids.length === 0) return <p className="text-sm opacity-70">{empty}</p>;
    return (
      <div className="flex flex-wrap gap-2">
        {ids.map((id) => {
          const s = ALL_STRENGTHS.find((x) => x.id === id);
          if (!s) return null;
          return (
            <span
              key={id}
              className="flex items-center gap-2 rounded-full border-l-4 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-900 shadow-sm"
              style={{ borderLeftColor: s.color }}
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
              {getStrengthName(id, lang)}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-8">
      <h1 className="font-display text-3xl">{tr("Vahvuuteni")} 🍬</h1>

      <StickyNote seed="student-strengths-picks" className="space-y-3">
        <h2 className="font-display text-xl">{tr("Valitsemasi vahvuudet")}</h2>
        <Pills ids={selected} empty={tr("Et ole vielä valinnut vahvuuksia karkkikaupasta.")} />
      </StickyNote>

      <StickyNote seed="student-strengths-gifts" className="space-y-3">
        <h2 className="font-display text-xl">{tr("Opettajalta saadut vahvuudet")}</h2>
        {gifts.length === 0 ? (
          <p className="text-sm opacity-70">{tr("Et ole vielä saanut vahvuuksia opettajalta.")}</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {gifts.map((g) => {
              const id = Number(g.strength_id);
              const s = ALL_STRENGTHS.find((x) => x.id === id);
              return (
                <li
                  key={g.id}
                  className="rounded-2xl border-l-4 bg-white/90 p-4 text-slate-900 shadow-sm"
                  style={{ borderLeftColor: s?.color ?? "var(--purple)" }}
                >
                  <div className="font-display text-lg">
                    🍬 {Number.isFinite(id) ? getStrengthName(id, lang) : g.strength_id}
                  </div>
                  {g.message && <p className="mt-1 text-sm">{g.message}</p>}
                  <div className="mt-2 text-xs opacity-60">
                    {g.teacher_name ?? tr("Opettaja")} ·{" "}
                    {new Date(g.created_at).toLocaleDateString()}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </StickyNote>

      <StickyNote seed="student-strengths-all" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl">{tr("Kaikki vahvuudet")}</h2>
          <span className="text-sm font-bold">
            {owned.size}/{ALL_STRENGTHS.length}
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-[color:var(--purple)] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {ALL_STRENGTHS.map((s) => {
            const isReceived = receivedIds.has(s.id);
            const isCollected = collectedIds.has(s.id);
            const state = isCollected
              ? tr("Kerätty")
              : isReceived
                ? tr("Saatu")
                : tr("Lukittu");
            return (
              <li
                key={s.id}
                className={
                  "flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm " +
                  (isCollected || isReceived
                    ? "bg-white/90 text-slate-900 shadow-sm"
                    : "bg-white/30 text-slate-900/50")
                }
              >
                <span className="truncate">
                  {isCollected ? "🍬" : isReceived ? "🎁" : "🔒"} {getStrengthName(s.id, lang)}
                </span>
                <span className="shrink-0 text-[0.65rem] uppercase tracking-wider opacity-70">
                  {state}
                </span>
              </li>
            );
          })}
        </ul>
      </StickyNote>
    </div>
  );
}
