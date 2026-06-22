import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { SaveIndicator } from "@/components/SaveIndicator";
import type { SaveState } from "@/hooks/use-autosave";
import { TOTAL_SCREENS } from "@/lib/screens";

export function BottomNav({
  n,
  saveState = "idle",
  showProgress = true,
  nextDisabled = false,
  nextHint,
  onBeforeNext,
}: {
  n: number;
  saveState?: SaveState;
  showProgress?: boolean;
  nextDisabled?: boolean;
  nextHint?: string;
  onBeforeNext?: () => void | Promise<void>;
}) {
  const navigate = useNavigate();
  async function goNext() {
    if (onBeforeNext) {
      try { await onBeforeNext(); } catch { /* swallow — nav still proceeds */ }
    }
    navigate({ to: "/seikkailu/$screen", params: { screen: String(n + 1) } });
  }
  return (
    <nav className="no-print sticky bottom-0 z-20 flex items-center justify-between gap-3 border-t border-white/10 bg-[color:var(--purple-dark)]/80 px-4 py-3 backdrop-blur">
      <Button
        variant="secondary"
        disabled={n <= 1}
        onClick={() => navigate({ to: "/seikkailu/$screen", params: { screen: String(n - 1) } })}
        className="rounded-full"
      >← Edellinen</Button>
      <div className="flex flex-col items-center text-xs opacity-90 min-h-[1.5rem] justify-center text-center">
        {showProgress && <span>Näyttö {n} / {TOTAL_SCREENS}</span>}
        {showProgress ? <SaveIndicator state={saveState} /> : nextDisabled && nextHint ? (
          <span className="text-[color:var(--yellow)]">{nextHint}</span>
        ) : null}
      </div>
      <Button
        disabled={n >= TOTAL_SCREENS || nextDisabled}
        onClick={goNext}
        className="rounded-full bg-[color:var(--coral)] hover:bg-[color:var(--coral)]/90 text-white"
      >Seuraava →</Button>
    </nav>
  );
}