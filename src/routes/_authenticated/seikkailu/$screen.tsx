import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StickyNote } from "@/components/StickyNote";
import { BottomNav } from "@/components/BottomNav";
import { PencilBadge } from "@/components/PencilBadge";
import { ScreenChrome } from "@/components/ScreenChrome";
import { TOTAL_SCREENS, worldForScreen } from "@/lib/screens";
import { PROLOGI_GATED, PrologiScreen, isPrologiContentScreen } from "@/lib/prologi-content";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/seikkailu/$screen")({
  component: ScreenView,
});

function ScreenView() {
  const { screen } = Route.useParams();
  const n = Math.max(1, Math.min(TOTAL_SCREENS, Number(screen) || 1));
  const world = worldForScreen(n);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [prologiRead, setPrologiRead] = useState<Set<number>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  // Load profile (name + current_screen bump) and Prologi completion set.
  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      setUserId(u.user.id);
      const { data: prof } = await supabase
        .from("profiles" as never)
        .select("current_screen, display_name")
        .eq("id", u.user.id)
        .maybeSingle();
      const p = prof as { current_screen?: number; display_name?: string | null } | null;
      setDisplayName(p?.display_name ?? null);
      const cur = p?.current_screen ?? 1;
      if (n > cur) {
        await supabase.from("profiles" as never).update({ current_screen: n } as never).eq("id", u.user.id);
      }
      const keys = PROLOGI_GATED.map((k) => `s${k}.read`);
      const { data: reads } = await supabase
        .from("responses" as never)
        .select("field_key")
        .eq("user_id", u.user.id)
        .in("field_key", keys);
      const set = new Set<number>();
      for (const r of (reads ?? []) as Array<{ field_key: string }>) {
        const m = r.field_key.match(/^s(\d+)\.read$/);
        if (m) set.add(Number(m[1]));
      }
      setPrologiRead(set);
    })();
  }, [n]);

  const isPrologi = isPrologiContentScreen(n);
  // Gate: leaving screen 6 → 7 requires all of {3,4,5,6} marked read.
  const wouldBlockNext =
    n === 6 && (() => {
      const after = new Set(prologiRead);
      after.add(6);
      return !PROLOGI_GATED.every((k) => after.has(k));
    })();

  async function markRead() {
    if (!isPrologi || !userId) return;
    if (prologiRead.has(n)) return;
    await supabase.from("responses" as never).upsert(
      { user_id: userId, field_key: `s${n}.read`, value: "1" } as never,
      { onConflict: "user_id,field_key" } as never,
    );
    setPrologiRead((s) => new Set(s).add(n));
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <ScreenChrome n={n} displayName={displayName} saveState="idle" />
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="mb-4 flex items-center gap-2">
          <PencilBadge>{world.title}</PencilBadge>
          <span className="text-sm opacity-80">{world.subtitle}</span>
        </div>
        {isPrologi ? (
          <PrologiScreen n={n} />
        ) : (
          <StickyNote seed={`s${n}`}>
            <h1 className="text-3xl mb-3">Näyttö {n}</h1>
            <p className="text-muted-foreground">
              Tämä on paikanvaraaja. Vahvuusseikkailun näytön <strong>{n}</strong> ({world.title})
              sisältö rakennetaan seuraavissa erissä.
            </p>
          </StickyNote>
        )}
      </div>
      <BottomNav
        n={n}
        saveState="idle"
        showProgress={false}
        onBeforeNext={isPrologi ? markRead : undefined}
        nextDisabled={wouldBlockNext}
        nextHint={wouldBlockNext ? "Selaa ensin Prologin näytöt 3–6." : undefined}
      />
    </div>
  );
}