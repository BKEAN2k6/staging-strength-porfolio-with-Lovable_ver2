import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StickyNote } from "@/components/StickyNote";
import { BottomNav } from "@/components/BottomNav";
import { PencilBadge } from "@/components/PencilBadge";
import { ScreenChrome } from "@/components/ScreenChrome";
import { TOTAL_SCREENS, worldForScreen } from "@/lib/screens";
import { ScreenContent, hasContent } from "@/lib/screen-content";
import { CompletionContext, REQUIREMENTS, COMPLETION_HINT } from "@/lib/screen-completion";
import { supabase } from "@/integrations/supabase/client";
import type { SaveState } from "@/hooks/use-autosave";

export const Route = createFileRoute("/_authenticated/seikkailu/$screen")({
  component: ScreenView,
});

function ScreenView() {
  const { screen } = Route.useParams();
  const n = Math.max(1, Math.min(TOTAL_SCREENS, Number(screen) || 1));
  const world = worldForScreen(n);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: prof } = await supabase
        .from("profiles" as never)
        .select("current_screen, display_name")
        .eq("id", u.user.id)
        .maybeSingle();
      const p = prof as { current_screen?: number; display_name?: string | null } | null;
      // Fallback order: profiles.display_name → email local-part → "Opiskelija".
      const fallback = u.user.email ? u.user.email.split("@")[0] : null;
      setDisplayName((p?.display_name && p.display_name.trim()) || fallback || null);
      const cur = p?.current_screen ?? 1;
      if (n > cur) {
        await supabase.from("profiles" as never).update({ current_screen: n } as never).eq("id", u.user.id);
      }
    })();
  }, [n]);

  // Reset per-screen completion tracking when the screen changes.
  const screenRef = useRef(n);
  useEffect(() => {
    if (screenRef.current !== n) {
      screenRef.current = n;
      setCompleted({});
    }
  }, [n]);

  const report = useCallback((key: string, c: boolean) => {
    setCompleted((prev) => (prev[key] === c ? prev : { ...prev, [key]: c }));
  }, []);

  const required = REQUIREMENTS[n];
  const isComplete = useMemo(
    () => !required || required.every((k) => completed[k]),
    [required, completed],
  );

  const built = hasContent(n);

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <ScreenChrome n={n} displayName={displayName} saveState={saveState} />
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <div className="mb-4 flex items-center gap-2">
          <PencilBadge>{world.title}</PencilBadge>
          <span className="text-sm opacity-80">{world.subtitle}</span>
        </div>
        <CompletionContext.Provider value={report}>
          {built ? (
            <ScreenContent n={n} onSaveStateChange={setSaveState} />
          ) : (
            <StickyNote seed={`s${n}`}>
              <h1 className="text-3xl mb-3">Näyttö {n}</h1>
              <p className="text-muted-foreground">
                Tämä on paikanvaraaja. Vahvuusseikkailun näytön <strong>{n}</strong> ({world.title})
                sisältö rakennetaan seuraavissa erissä.
              </p>
            </StickyNote>
          )}
        </CompletionContext.Provider>
      </div>
      <BottomNav
        n={n}
        saveState={saveState}
        showProgress={false}
        nextDisabled={!isComplete}
        nextHint={!isComplete ? COMPLETION_HINT : undefined}
      />
    </div>
  );
}
