import { useEffect, useState } from "react";
import { useAutosave, loadResponse, type SaveState } from "@/hooks/use-autosave";
import { useReportCompletion } from "@/lib/screen-completion";
import { cn } from "@/lib/utils";

export function SelectableChips({
  fieldKey,
  options,
  onSaveStateChange,
  max,
  min = 1,
}: {
  fieldKey: string;
  options: string[];
  onSaveStateChange?: (s: SaveState) => void;
  max?: number;
  min?: number;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const report = useReportCompletion();

  useEffect(() => {
    (async () => {
      const v = await loadResponse<string[]>(fieldKey);
      if (Array.isArray(v)) setSelected(v);
      setLoaded(true);
    })();
  }, [fieldKey]);

  const state = useAutosave(fieldKey, selected, { enabled: loaded });
  useEffect(() => { onSaveStateChange?.(state); }, [state, onSaveStateChange]);

  useEffect(() => {
    if (!loaded) return;
    report(fieldKey, selected.length >= min);
  }, [selected, loaded, fieldKey, report, min]);

  function toggle(opt: string) {
    setSelected((cur) => {
      if (cur.includes(opt)) return cur.filter((c) => c !== opt);
      if (max && cur.length >= max) return cur;
      return [...cur, opt];
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt);
        const atMax = !!max && selected.length >= max && !active;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            disabled={atMax}
            className={cn(
              "rounded-full border-2 px-3 py-1.5 text-sm font-medium transition-all",
              active
                ? "bg-[color:var(--coral)] border-[color:var(--coral)] text-white shadow-md scale-105"
                : "bg-white/90 text-slate-900 border-white/40 hover:bg-white",
              atMax && "opacity-40 cursor-not-allowed hover:bg-white/90",
            )}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
