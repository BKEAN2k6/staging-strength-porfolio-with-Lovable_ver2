import type { ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { CornerBlobs } from "@/components/CornerBlobs";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTr } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface ShellTab {
  id: string;
  label: string;
}

/**
 * Shared chrome for the role dashboards: left nav, school name bottom-left,
 * FI | SV | EN switcher top-right.
 */
export function DashboardShell({
  title,
  tabs,
  active,
  onSelect,
  schoolName,
  persistLanguage = true,
  children,
}: {
  title: string;
  tabs: ShellTab[];
  active: string;
  onSelect: (id: string) => void;
  schoolName?: string | null;
  persistLanguage?: boolean;
  children: ReactNode;
}) {
  const tr = useTr();
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth/login", replace: true });
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <CornerBlobs />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl gap-6 px-4 py-8">
        <aside className="hidden w-56 shrink-0 flex-col md:flex">
          <p className="mb-3 text-sm font-bold opacity-70">{title}</p>
          <nav className="space-y-1">
            {tabs.map((tb) => (
              <button
                key={tb.id}
                type="button"
                onClick={() => onSelect(tb.id)}
                className={cn(
                  "block w-full rounded-full px-4 py-2 text-left text-sm font-semibold transition-colors",
                  active === tb.id
                    ? "bg-[color:var(--purple)] text-white"
                    : "text-foreground hover:bg-black/5",
                )}
              >
                {tb.label}
              </button>
            ))}
          </nav>
          <button
            type="button"
            className="mt-6 px-4 text-left text-xs underline opacity-70"
            onClick={() => void signOut()}
          >
            {tr("Kirjaudu ulos")}
          </button>
          <div className="mt-auto truncate pt-10 text-xs opacity-50">{schoolName ?? ""}</div>
        </aside>

        <main className="min-w-0 flex-1 space-y-6">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
            <LanguageSwitcher persistToProfile={persistLanguage} />
          </header>

          <nav className="flex flex-wrap gap-2 md:hidden">
            {tabs.map((tb) => (
              <button
                key={tb.id}
                type="button"
                onClick={() => onSelect(tb.id)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-semibold",
                  active === tb.id
                    ? "bg-[color:var(--purple)] text-white"
                    : "bg-black/5 text-foreground",
                )}
              >
                {tb.label}
              </button>
            ))}
          </nav>

          {children}

          <p className="pt-6 text-xs opacity-50 md:hidden">{schoolName ?? ""}</p>
        </main>
      </div>
    </div>
  );
}
