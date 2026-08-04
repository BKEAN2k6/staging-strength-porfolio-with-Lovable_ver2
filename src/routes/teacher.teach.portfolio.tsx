/**
 * @lovable-new 2026-08-04
 * Teacher "Teach → Strength Portfolio": browse all 106 adventure screens and
 * project any of them fullscreen, read-only, for the class.
 */
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { StickyNote } from "@/components/StickyNote";
import { DashboardShell } from "@/components/DashboardShell";
import { PresentationOverlay } from "@/components/teach/PresentationOverlay";
import { WorldIcon } from "@/components/icons/AppIcons";
import { useRoleGuard } from "@/lib/role-guard";
import { TranslateFi, useTr } from "@/lib/i18n";
import { WORLDS, TOTAL_SCREENS } from "@/lib/screens";
import { ScreenContent, hasContent } from "@/lib/screen-content";

export const Route = createFileRoute("/teacher/teach/portfolio")({
  head: () => ({
    meta: [
      { title: "Strength Portfolio presentation — Vahvuusseikkailu" },
      {
        name: "description",
        content: "Project any of the 106 strength portfolio screens fullscreen for your class.",
      },
      { property: "og:title", content: "Strength Portfolio presentation — Vahvuusseikkailu" },
      {
        property: "og:description",
        content: "Read-only classroom presentation mode for all 106 portfolio screens.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TeachPortfolioPage,
});

/** Renders adventure content with every control inert. */
function ReadOnlyScreen({ n }: { n: number }) {
  if (!hasContent(n)) return null;
  return (
    <div className="pointer-events-none select-none [&_button]:pointer-events-none [&_input]:pointer-events-none [&_textarea]:pointer-events-none">
      <TranslateFi>
        <ScreenContent n={n} />
      </TranslateFi>
    </div>
  );
}

function TeachPortfolioPage() {
  const tr = useTr();
  const guard = useRoleGuard(["teacher"]);
  const [presenting, setPresenting] = useState<number | null>(null);

  if (!guard.ready) return null;

  return (
    <>
      <DashboardShell
        title={tr("Vahvuusportfolio")}
        tabs={[]}
        active=""
        onSelect={() => undefined}
        schoolName={guard.schoolName}
        links={[
          { to: "/teacher/dashboard", label: tr("Takaisin") },
          { to: "/teacher/teach/materials", label: tr("Opetusmateriaalit") },
        ]}
      >
        <p className="text-sm opacity-80">{tr("Näytä luokalle")}</p>

        {WORLDS.map((w) => (
          <StickyNote key={w.id} seed={`teach-${w.id}`} className="space-y-3">
            <h3 className="flex items-center gap-2 text-xl font-bold">
              <WorldIcon id={w.id} size={18} />
              {tr(w.title)} — {tr(w.subtitle)}
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: w.end - w.start + 1 }, (_, i) => w.start + i).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPresenting(n)}
                  className="space-y-2 rounded-2xl bg-white/85 p-2 text-left text-slate-900 shadow transition-transform hover:-translate-y-0.5"
                >
                  <span className="block text-xs font-bold opacity-70">
                    {tr("Näyttö")} {n}
                  </span>
                  <span className="block break-words text-sm font-bold leading-snug">
                    {tr("Näytä luokalle")}
                  </span>
                </button>
              ))}
            </div>
          </StickyNote>
        ))}
      </DashboardShell>

      {presenting != null && (
        <PresentationOverlay
          index={presenting - 1}
          total={TOTAL_SCREENS}
          counter={`${tr("Näyttö")} ${presenting} / ${TOTAL_SCREENS}`}
          onPrev={() => setPresenting((p) => Math.max(1, (p ?? 1) - 1))}
          onNext={() => setPresenting((p) => Math.min(TOTAL_SCREENS, (p ?? 1) + 1))}
          onExit={() => setPresenting(null)}
        >
          <div className="rounded-[2rem] bg-white/95 p-8 text-[color:var(--ink)] shadow-2xl md:p-12 md:text-lg">
            <ReadOnlyScreen n={presenting} />
          </div>
        </PresentationOverlay>
      )}
    </>
  );
}
