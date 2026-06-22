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
  const name = (displayName && displayName.trim()) || "Opiskelija";
  return (
    <div className="no-print sticky top-14 z-10 flex items-center justify-end gap-3 border-b border-white/10 bg-[color:var(--purple-dark)]/60 px-4 py-2 text-xs backdrop-blur">
      <span className="opacity-90 truncate max-w-[50vw]" title={name}>
        {name}
      </span>
      <span className="opacity-30">•</span>
      <span className="font-mono opacity-90 whitespace-nowrap">Näyttö {n} / {TOTAL_SCREENS}</span>
      <span className="opacity-30">•</span>
      <SaveIndicator state={saveState} />
    </div>
  );
}
