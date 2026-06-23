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
    <label className="block">
      {label && <div className="mb-1 text-sm font-display font-semibold text-[color:var(--cream,white)]">✏️ {label}</div>}
      <div className="workbook-paper">
        <textarea
          className="w-full bg-transparent text-slate-900 px-4 py-3 text-[0.95rem] leading-[1.65rem] focus:outline-none rounded-[1.25rem] resize-y"
          rows={rows}
          placeholder={placeholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    </label>
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
    <div className="workbook-pill flex items-center gap-2 text-slate-900 px-4 py-2">
      {prefix && <span className="font-display text-sm uppercase tracking-wide opacity-70 whitespace-nowrap">{prefix}</span>}
      <input
        className="flex-1 bg-transparent text-sm focus:outline-none"
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

