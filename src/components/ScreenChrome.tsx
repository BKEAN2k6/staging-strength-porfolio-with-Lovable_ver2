import { TOTAL_SCREENS } from "@/lib/screens";
import { SaveIndicator } from "@/components/SaveIndicator";
import type { SaveState } from "@/hooks/use-autosave";

export function ScreenChrome({
  n,
  displayName,
  saveState = "idle",
}: {
  n: number;
  displayName?: string | null;
  saveState?: SaveState;
}) {
  return (
    <div className="no-print sticky top-14 z-10 flex items-center justify-end gap-3 border-b border-white/10 bg-[color:var(--purple-dark)]/60 px-4 py-2 text-xs backdrop-blur">
      {displayName && (
        <span className="opacity-90 truncate max-w-[40vw]" title={displayName}>
          {displayName}
        </span>
      )}
      <span className="opacity-30">•</span>
      <span className="font-mono opacity-90">Näyttö {n} / {TOTAL_SCREENS}</span>
      <span className="opacity-30">•</span>
      <SaveIndicator state={saveState} />
    </div>
  );
}