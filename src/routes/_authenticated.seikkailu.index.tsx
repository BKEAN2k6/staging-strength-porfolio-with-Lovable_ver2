import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { WORLDS, TOTAL_SCREENS, worldForScreen } from "@/lib/screens";
import { WorldBadge } from "@/components/WorldBadge";
import { StickyNote } from "@/components/StickyNote";
import { Button } from "@/components/ui/button";
import { getCurrentScreen } from "@/lib/auth-helpers";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/seikkailu/")({
  component: WorldMap,
});

interface Progress { current: number; completedByWorld: Record<string, number>; }

async function loadProgress(): Promise<Progress> {
  const current = await getCurrentScreen();
  const { data: u } = await supabase.auth.getUser();
  const completedByWorld: Record<string, number> = {};
  if (u.user) {
    const { data } = await supabase
      .from("responses" as never)
      .select("field_key")
      .eq("user_id", u.user.id);
    const screens = new Set<number>();
    for (const row of (data ?? []) as Array<{ field_key: string }>) {
      const m = row.field_key.match(/^s(\d+)\./);
      if (m) screens.add(Number(m[1]));
    }
    for (const w of WORLDS) {
      let c = 0;
      for (let n = w.start; n <= w.end; n++) if (screens.has(n)) c++;
      completedByWorld[w.id] = c;
    }
  }
  return { current, completedByWorld };
}

function WorldMap() {
  const navigate = useNavigate();
  const [p, setP] = useState<Progress | null>(null);

  useEffect(() => { loadProgress().then(setP); }, []);

  const current = p?.current ?? 1;
  const currentWorld = worldForScreen(current);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-4xl">Maailmankartta</h1>
          <p className="opacity-85 mt-1">Valitse maailma tai jatka siitä, mihin jäit.</p>
        </div>
        <StickyNote tone="yellow" seed="resume" className="!p-3 !px-4 max-w-xs">
          <div className="text-xs font-semibold uppercase tracking-wide">Jatka seikkailua</div>
          <div className="font-display text-lg leading-tight">{currentWorld.title} — näyttö {current}</div>
          <Button
            className="mt-2 rounded-full bg-[color:var(--coral)] hover:bg-[color:var(--coral)]/90 text-white"
            onClick={() => navigate({ to: "/seikkailu/$screen", params: { screen: String(current) } })}
          >Jatka →</Button>
        </StickyNote>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WORLDS.map((w, idx) => {
          const completed = p?.completedByWorld[w.id] ?? 0;
          const len = w.end - w.start + 1;
          // Gating: prologi always open; world N+1 unlocks when world N has any completion OR current >= w.start
          const prev = idx > 0 ? WORLDS[idx - 1] : null;
          const prevDone = prev ? (p?.completedByWorld[prev.id] ?? 0) >= (prev.end - prev.start + 1) : true;
          const locked = idx > 0 && current < w.start && !prevDone;
          return (
            <WorldBadge
              key={w.id}
              world={w}
              locked={locked}
              progress={len > 0 ? completed / len : 0}
              onClick={() => navigate({ to: "/seikkailu/$screen", params: { screen: String(Math.max(w.start, Math.min(current, w.end))) } })}
            />
          );
        })}
      </div>

      <p className="mt-8 text-center text-xs opacity-70">{TOTAL_SCREENS} näyttöä • Vahvuusseikkailu</p>
    </div>
  );
}