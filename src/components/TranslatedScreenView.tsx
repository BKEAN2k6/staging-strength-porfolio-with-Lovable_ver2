import { StickyNote } from "@/components/StickyNote";
import { useLanguage } from "@/context/LanguageContext";
import { getScreenContent } from "@/lib/screen-strings";

/**
 * Renders every workbook string mapped to the given screen in the active
 * language, sourced from src/lib/screen-strings.ts (auto-generated from the
 * translation workbook). Use as a language-aware fallback for screens whose
 * bespoke JSX has not yet been migrated to `getScreenContent`.
 */
export function TranslatedScreenView({ screenNr }: { screenNr: number }) {
  const { language } = useLanguage();
  const lines = getScreenContent(screenNr, language);
  if (lines.length === 0) return null;

  return (
    <div className="space-y-4">
      {lines.map((line, i) => {
        const section = (line.section ?? "").toLowerCase();
        const isTitle = /rubrik|titel|otsikko|header/.test(section);
        const tone = isTitle ? "yellow" : i % 2 === 0 ? "white" : "mint";
        return (
          <StickyNote key={line.key} tone={tone} seed={line.key}>
            {isTitle ? (
              <h2 className="font-display text-2xl leading-tight">{line.text}</h2>
            ) : (
              <p className="text-base leading-relaxed whitespace-pre-line">{line.text}</p>
            )}
          </StickyNote>
        );
      })}
    </div>
  );
}
