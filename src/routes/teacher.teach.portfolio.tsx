/**
 * @lovable-new 2026-08-05
 * Teacher "Teach → Strength Portfolio": a level sub-navigator plus the real
 * adventure screens rendered read-only, and an in-app fullscreen present mode.
 */
import { createFileRoute } from "@tanstack/react-router";
import { Component, useState, type ReactNode } from "react";
import { StickyNote } from "@/components/StickyNote";
import { DashboardShell } from "@/components/DashboardShell";
import { PresentationOverlay } from "@/components/teach/PresentationOverlay";
import { LevelProgressBar } from "@/components/LevelProgressBar";
import { WorldIcon } from "@/components/icons/AppIcons";
import { useRoleGuard } from "@/lib/role-guard";
import { TranslateFi, useTr } from "@/lib/i18n";
import { WORLDS, TOTAL_SCREENS, type WorldId } from "@/lib/screens";
import { ScreenContent, hasContent } from "@/lib/screen-content";
import { cn } from "@/lib/utils";

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

/** Keeps a single misbehaving screen from taking down the whole page. */
class ScreenBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.error("[teach-portfolio] screen render failed", error);
  }
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

/** Renders adventure content with every control inert. */
function ReadOnlyScreen({ n }: { n: number }) {
  if (!hasContent(n)) return null;
  return (
    <ScreenBoundary>
      <div
        aria-disabled
        className="pointer-events-none select-none opacity-95 [&_button]:pointer-events-none [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none"
      >
        <TranslateFi>
          <ScreenContent n={n} />
        </TranslateFi>
      </div>
    </ScreenBoundary>
  );
}


function TeachPortfolioPage() {
  const tr = useTr();
  const guard = useRoleGuard(["teacher"]);
  const [worldId, setWorldId] = useState<WorldId>(WORLDS[0].id);
  const [presenting, setPresenting] = useState<number | null>(null);

  if (!guard.ready) return null;

  const world = WORLDS.find((w) => w.id === worldId) ?? WORLDS[0];
  const screens = Array.from(
    { length: world.end - world.start + 1 },
    (_, i) => world.start + i,
  ).filter((n) => hasContent(n));

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
        <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
          {/* Level sub-navigator */}
          <nav className="h-max space-y-2 rounded-3xl bg-[color:var(--purple)] p-3 text-white shadow-lg">
            {WORLDS.map((w) => {
              const active = w.id === worldId;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setWorldId(w.id)}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-2xl px-3 py-2 text-left transition-colors",
                    active ? "bg-white text-[color:var(--purple)]" : "hover:bg-white/10",
                  )}
                >
                  <WorldIcon id={w.id} size={18} className="mt-0.5 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-sm font-bold leading-snug">
                      {tr(w.title)}
                    </span>
                    <span className="block break-words text-xs leading-snug opacity-80">
                      {tr(w.subtitle)}
                    </span>
                    <LevelProgressBar pct={0} className="mt-1" />
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Screens of the selected level, exactly as students see them */}
          <div className="space-y-4">
            <p className="text-sm opacity-80">
              {tr(world.title)} — {tr(world.subtitle)}
            </p>
            {screens.map((n) => (
              <StickyNote key={n} seed={`teach-screen-${n}`} className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-bold">
                    {tr("Näyttö")} {n} / {TOTAL_SCREENS}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setPresenting(n)}
                    className="rounded-full bg-[color:var(--purple)] px-4 py-2 text-sm font-bold text-white shadow"
                  >
                    {tr("Näytä luokalle")}
                  </button>
                </div>
                <ReadOnlyScreen n={n} />
              </StickyNote>
            ))}
          </div>
        </div>
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
