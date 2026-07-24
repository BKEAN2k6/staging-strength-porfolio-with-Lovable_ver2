// UI chrome strings (buttons, labels, navigation, module blurbs).
// This is a thin re-export over the canonical `UI` dictionary in
// `@/lib/i18n` so callers can `import { t } from "@/lib/i18n/strings"`.
//
// Screen body content (questions, prompts, paragraphs) is NOT here —
// that lives in `screen-content.tsx` and flows through the Excel-based
// `useTFi` / `TranslateFi` translators.

import { UI, type Language } from "@/lib/i18n";

export { UI };

export function t(
  key: string,
  language: Language = "fi",
  vars?: Record<string, string | number>,
): string {
  const raw = UI[language]?.[key] ?? UI.fi[key];
  if (!raw) {
    // eslint-disable-next-line no-console
    console.warn(`[i18n] Missing UI translation for key: ${key}`);
    return key;
  }
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k: string) => {
    const v = vars[k];
    return v === undefined ? "{" + k + "}" : String(v);
  });
}
