import { useEffect, useState } from "react";
import { useAutosave, loadResponse, type SaveState } from "@/hooks/use-autosave";

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

  useEffect(() => {
    (async () => {
      const v = await loadResponse<string>(fieldKey);
      if (typeof v === "string") setValue(v);
      setLoaded(true);
    })();
  }, [fieldKey]);

  const state = useAutosave(fieldKey, value, { enabled: loaded });
  useEffect(() => { onSaveStateChange?.(state); }, [state, onSaveStateChange]);

  return (
    <label className="block">
      {label && <div className="mb-1 text-sm font-medium">{label}</div>}
      <textarea
        className="w-full rounded-2xl border border-white/20 bg-white/90 text-slate-900 px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-[color:var(--coral)]"
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
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
  useEffect(() => {
    (async () => {
      const v = await loadResponse<string>(fieldKey);
      if (typeof v === "string") setValue(v);
      setLoaded(true);
    })();
  }, [fieldKey]);
  const state = useAutosave(fieldKey, value, { enabled: loaded });
  useEffect(() => { onSaveStateChange?.(state); }, [state, onSaveStateChange]);
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/90 text-slate-900 px-4 py-2 shadow-inner">
      {prefix && <span className="font-display text-sm uppercase tracking-wide opacity-70">{prefix}</span>}
      <input
        className="flex-1 bg-transparent text-sm focus:outline-none"
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}