import type { SaveState } from "@/hooks/use-autosave";
import { Check, Loader2, TriangleAlert } from "lucide-react";

export function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "idle") return <span className="text-xs opacity-60">Valmis</span>;
  if (state === "saving") return (
    <span className="text-xs inline-flex items-center gap-1 opacity-90">
      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Tallennetaan…
    </span>
  );
  if (state === "saved") return (
    <span className="text-xs inline-flex items-center gap-1 opacity-90">
      <Check className="h-3.5 w-3.5" /> Tallennettu
    </span>
  );
  return (
    <span className="text-xs inline-flex items-center gap-1 text-[color:var(--coral)]">
      <TriangleAlert className="h-3.5 w-3.5" /> Tallennus epäonnistui
    </span>
  );
}