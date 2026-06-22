import { TOTAL_SCREENS } from "@/lib/screens";
import { SaveIndicator } from "@/components/SaveIndicator";
import type { SaveState } from "@/hooks/use-autosave";

export function ScreenChrome({
  n,
  saveState = "idle",
}: {
  n: number;
  /** Kept for backwards-compatibility — student name now lives in TopBar. */
  displayName?: string | null;
  saveState?: SaveState;
}) {
  return (
    <div className="no-print sticky top-14 z-10 flex items-center justify-end gap-3 border-b border-white/10 bg-[color:var(--purple-dark)]/60 px-4 py-2 text-xs backdrop-blur">
      <span className="font-mono opacity-90 whitespace-nowrap">Näyttö {n} / {TOTAL_SCREENS}</span>
      <span className="opacity-30">•</span>
      <SaveIndicator state={saveState} />
    </div>
  );
}
