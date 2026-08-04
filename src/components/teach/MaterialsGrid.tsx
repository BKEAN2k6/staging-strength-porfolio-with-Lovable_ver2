/**
 * @lovable-new 2026-08-04
 * Teaching materials: shared data helpers + the teacher/principal-facing
 * grid with fullscreen slide presentation.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { StickyNote } from "@/components/StickyNote";
import { PresentationOverlay } from "@/components/teach/PresentationOverlay";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage, useTr, type Language } from "@/lib/i18n";

export interface TeachingPresentation {
  id: string;
  title_fi: string;
  title_en: string;
  title_sv: string;
  description_fi: string | null;
  description_en: string | null;
  description_sv: string | null;
  canva_design_id: string;
  canva_export_url: string | null;
  thumbnail_url: string | null;
  slide_urls: string[];
  slide_count: number;
  level_tag: string;
  sort_order: number;
  is_published: boolean;
}

export const LEVEL_TAGS = [
  "general",
  "prologi",
  "m1",
  "m2",
  "m3",
  "m4",
  "m5",
  "m6",
] as const;

export const LEVEL_TAG_LABEL: Record<string, string> = {
  general: "Yleinen",
  prologi: "Prologi",
  m1: "Taso 1",
  m2: "Taso 2",
  m3: "Taso 3",
  m4: "Taso 4",
  m5: "Taso 5",
  m6: "Taso 6",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function toRow(r: any): TeachingPresentation {
  return {
    ...r,
    slide_urls: Array.isArray(r.slide_urls) ? (r.slide_urls as string[]) : [],
  } as TeachingPresentation;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function fetchPresentations(
  opts: { includeUnpublished?: boolean } = {},
): Promise<TeachingPresentation[]> {
  let q = supabase
    .from("teaching_presentations")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (!opts.includeUnpublished) q = q.eq("is_published", true);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []).map(toRow);
}

export function titleOf(p: TeachingPresentation, lang: Language): string {
  return (lang === "en" ? p.title_en : lang === "sv" ? p.title_sv : p.title_fi) || p.title_fi;
}

export function descriptionOf(p: TeachingPresentation, lang: Language): string {
  return (
    (lang === "en" ? p.description_en : lang === "sv" ? p.description_sv : p.description_fi) ?? ""
  );
}

/** Canva embed URL used when no exported slide images exist yet. */
export function canvaEmbedUrl(p: TeachingPresentation): string {
  if (p.canva_export_url) return p.canva_export_url;
  return `https://www.canva.com/design/${p.canva_design_id}/view?embed`;
}

export function MaterialsGrid() {
  const tr = useTr();
  const { language } = useLanguage();
  const [items, setItems] = useState<TeachingPresentation[]>([]);
  const [open, setOpen] = useState<TeachingPresentation | null>(null);
  const [slide, setSlide] = useState(0);

  const load = useCallback(async () => {
    try {
      setItems(await fetchPresentations());
    } catch (e) {
      console.error("[materials]", e);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const grouped = useMemo(() => {
    const map = new Map<string, TeachingPresentation[]>();
    for (const p of items) {
      const key = p.level_tag || "general";
      map.set(key, [...(map.get(key) ?? []), p]);
    }
    return [...map.entries()];
  }, [items]);

  const slides = open?.slide_urls ?? [];
  const total = Math.max(slides.length, 1);

  return (
    <>
      {items.length === 0 && (
        <StickyNote seed="materials-empty">
          <p className="opacity-70">{tr("Ei esityksiä vielä.")}</p>
        </StickyNote>
      )}

      {grouped.map(([tag, list]) => (
        <StickyNote key={tag} seed={`materials-${tag}`} className="space-y-3">
          <h3 className="text-xl font-bold">{tr(LEVEL_TAG_LABEL[tag] ?? "Yleinen")}</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setOpen(p);
                  setSlide(0);
                }}
                className="space-y-2 rounded-3xl bg-white/90 p-3 text-left text-slate-900 shadow-md transition-transform hover:-translate-y-0.5"
              >
                {p.thumbnail_url ? (
                  <img
                    src={p.thumbnail_url}
                    alt={titleOf(p, language)}
                    loading="lazy"
                    className="aspect-video w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="aspect-video w-full rounded-2xl bg-[color:var(--purple)]/15" />
                )}
                <span className="block text-sm font-bold leading-snug">
                  {titleOf(p, language)}
                </span>
                <span className="block text-xs leading-snug opacity-70">
                  {descriptionOf(p, language)}
                </span>
                <span className="block text-xs font-semibold opacity-60">
                  {p.slide_count} · {tr(LEVEL_TAG_LABEL[p.level_tag] ?? "Yleinen")}
                </span>
              </button>
            ))}
          </div>
        </StickyNote>
      ))}

      {open && (
        <PresentationOverlay
          index={slide}
          total={total}
          counter={`${slide + 1} / ${total}`}
          onPrev={() => setSlide((s) => Math.max(0, s - 1))}
          onNext={() => setSlide((s) => Math.min(total - 1, s + 1))}
          onExit={() => setOpen(null)}
        >
          {slides.length > 0 ? (
            <img
              src={slides[slide]}
              alt={`${titleOf(open, language)} — ${slide + 1}`}
              className="mx-auto max-h-[80vh] w-full rounded-2xl object-contain shadow-2xl"
            />
          ) : (
            <iframe
              title={titleOf(open, language)}
              src={canvaEmbedUrl(open)}
              allowFullScreen
              className="mx-auto aspect-video w-full rounded-2xl border-0 shadow-2xl"
            />
          )}
        </PresentationOverlay>
      )}
    </>
  );
}
