/**
 * @lovable-new 2026-07-31
 * Shared 26-strength picker grid (canonical registry + brand hex colours).
 */
import { ALL_STRENGTHS } from "@/lib/strength-jar-data";
import { getStrengthName } from "@/lib/strengths-i18n";
import { cn } from "@/lib/utils";

export function StrengthPickerGrid({
  lang,
  selected,
  onSelect,
  disabled,
  className,
}: {
  lang: "fi" | "sv" | "en";
  selected?: number | null;
  onSelect: (id: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
        className,
      )}
    >
      {ALL_STRENGTHS.map((s) => (
        <button
          key={s.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(s.id)}
          className={cn(
            "flex flex-col items-center gap-2 rounded-3xl bg-white/90 p-3 text-center text-slate-900 shadow-md transition-transform hover:-translate-y-0.5 disabled:opacity-50",
            selected === s.id && "border-4 border-[color:var(--yellow)]",
          )}
        >
          <span
            className="h-12 w-12 rounded-full shadow-inner"
            style={{ background: s.color }}
            aria-hidden
          />
          <span className="break-words text-xs font-bold leading-tight">
            {getStrengthName(s.id, lang)}
          </span>
        </button>
      ))}
    </div>
  );
}
