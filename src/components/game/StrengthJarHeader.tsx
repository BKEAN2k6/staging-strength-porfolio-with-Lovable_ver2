import { useState } from "react";
import { useLanguage, useTr } from "@/lib/i18n";
import { useStrengthJar } from "@/hooks/useStrengthJar";
import { ALL_STRENGTHS } from "@/lib/strength-jar-data";
import { getStrengthName } from "@/lib/strengths-i18n";
import { useReceivedGifts } from "@/hooks/useReceivedGifts";
import { cn } from "@/lib/utils";

/**
 * Compact strength jar for the top bar: jar icon + count, opens a drawer
 * listing the student's selected and collected strengths. Display only.
 */
export function StrengthJarHeader() {
  const tr = useTr();
  const { language } = useLanguage();
  const lang = language === "sv" ? "sv" : language === "en" ? "en" : "fi";
  const { selected, collected, totalCount } = useStrengthJar();
  const { gifts: received } = useReceivedGifts();
  const receivedIds = received
    .map((r) => Number(r.strength_id))
    .filter((n) => Number.isFinite(n));
  const badgeCount = totalCount + receivedIds.length;
  const [open, setOpen] = useState(false);

  function Pills({ ids }: { ids: number[] }) {
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
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={tr("Avaa vahvuuspurkki")}
        title={`${badgeCount} ${tr("vahvuudet")}`}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl transition-transform hover:scale-105 hover:bg-white/20 active:scale-95"
      >
        <span aria-hidden>🍬</span>
        {badgeCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--coral)] px-1 text-[11px] font-bold leading-none text-white shadow">
            {badgeCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 animate-in fade-in"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <aside
            role="dialog"
            aria-modal="true"
            className={cn(
              "fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col",
              "bg-[color:var(--purple-dark)] text-foreground shadow-2xl animate-in slide-in-from-right",
            )}
          >
            <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h3 className="font-display text-xl">{tr("Vahvuutesi")} ✨</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={tr("Sulje")}
                className="rounded-full px-2 py-1 text-lg hover:bg-white/10"
              >
                ✕
              </button>
            </header>

            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-4">
              {selected.length > 0 && (
                <section>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-widest opacity-70">
                    {tr("Valitsemasi vahvuudet")}
                  </h4>
                  <Pills ids={selected} />
                </section>
              )}

              {collected.length > 0 && (
                <section>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-widest opacity-70">
                    {tr("Seikkailussa kerätyt")}
                  </h4>
                  <Pills ids={collected} />
                </section>
              )}

              {receivedIds.length > 0 && (
                <section>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-widest opacity-70">
                    {tr("Opettajalta saadut vahvuudet")}
                  </h4>
                  <Pills ids={receivedIds} />
                  <ul className="mt-2 space-y-1 text-xs opacity-80">
                    {received
                      .filter((r) => r.message)
                      .map((r) => (
                        <li key={r.id} title={`${r.teacher_name ?? tr("Opettaja")}: ${r.message}`}>
                          {getStrengthName(Number(r.strength_id), lang)}: {r.message}
                        </li>
                      ))}
                  </ul>
                </section>
              )}

              {badgeCount === 0 && (
                <p className="px-2 py-10 text-center text-sm opacity-70">
                  {tr("Kerää vahvuuksia seikkailun aikana")} 🍬
                </p>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
