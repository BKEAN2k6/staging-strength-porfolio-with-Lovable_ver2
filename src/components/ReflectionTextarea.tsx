import { useEffect, useState } from "react";
import { useAutosave, loadResponse, type SaveState } from "@/hooks/use-autosave";
import { useReportCompletion } from "@/lib/screen-completion";

export function ReflectionTextarea({
  fieldKey,
  label,
  placeholder,
  rows = 3,
  onSaveStateChange,
}: {
  fieldKey: string;
  label?: string;
  placeholder?: string;
  rows?: number;
  onSaveStateChange?: (s: SaveState) => void;
}) {
  const [value, setValue] = useState("");
  const [loaded, setLoaded] = useState(false);
  const report = useReportCompletion();

  useEffect(() => {
    (async () => {
      const v = await loadResponse<string>(fieldKey);
      if (typeof v === "string") setValue(v);
      setLoaded(true);
    })();
  }, [fieldKey]);

  const state = useAutosave(fieldKey, value, { enabled: loaded });
  useEffect(() => { onSaveStateChange?.(state); }, [state, onSaveStateChange]);

  useEffect(() => {
    if (!loaded) return;
    report(fieldKey, value.trim().length > 0);
  }, [value, loaded, fieldKey, report]);

  return (
    <div className="block text-left">
      {label && (
        <label htmlFor={fieldKey} className="mb-1.5 block text-left text-sm font-display font-semibold text-[color:var(--ink)]">
          {label}
        </label>
      )}
      <div className="workbook-paper">
        <textarea
          id={fieldKey}
          className="block w-full bg-transparent text-slate-900 text-left text-[0.95rem] leading-[1.65rem] focus:outline-none resize-y placeholder:text-slate-400"
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    </div>
  );
}


export function ReflectionInput({
  fieldKey,
  placeholder,
  prefix,
  onSaveStateChange,
}: {
  fieldKey: string;
  placeholder?: string;
  prefix?: string;
  onSaveStateChange?: (s: SaveState) => void;
}) {
  const [value, setValue] = useState("");
  const [loaded, setLoaded] = useState(false);
  const report = useReportCompletion();

  useEffect(() => {
    (async () => {
      const v = await loadResponse<string>(fieldKey);
      if (typeof v === "string") setValue(v);
      setLoaded(true);
    })();
  }, [fieldKey]);
  const state = useAutosave(fieldKey, value, { enabled: loaded });
  useEffect(() => { onSaveStateChange?.(state); }, [state, onSaveStateChange]);
  useEffect(() => {
    if (!loaded) return;
    report(fieldKey, value.trim().length > 0);
  }, [value, loaded, fieldKey, report]);

  return (
    <div className="workbook-line flex items-baseline gap-2 text-slate-900 text-left">
      {prefix && (
        <span className="font-display text-sm font-semibold whitespace-nowrap text-[color:var(--ink)]/80">
          {prefix}
        </span>
      )}
      <input
        className="flex-1 bg-transparent text-[0.95rem] leading-[1.65rem] focus:outline-none placeholder:text-slate-400"
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
