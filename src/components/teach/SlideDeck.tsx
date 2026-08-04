/**
 * @lovable-new 2026-08-05
 * Google Slides deck rendering for the Teach section.
 *
 * Browse mode = every slide stacked in a scrollable list (quick scanning).
 * Present mode = one slide at a time, fullscreen, arrow keys + Escape.
 */
import { useCallback, useEffect, useState } from "react";
import { PresentationOverlay } from "@/components/teach/PresentationOverlay";
import { slidesEmbedUrl, slidesId } from "@/lib/google-slides";
import { useTr } from "@/lib/i18n";

const DEFAULT_SLIDES = 10;

export function SlideDeck({
  url,
  title,
  lang,
  slideCount,
}: {
  url: string | null | undefined;
  title: string;
  lang: "fi" | "en" | "sv";
  slideCount?: number | null;
}) {
  const tr = useTr();
  const [index, setIndex] = useState(0);
  const [presenting, setPresenting] = useState(false);

  const total = slideCount && slideCount > 0 ? slideCount : DEFAULT_SLIDES;
  const id = slidesId(url);

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const next = useCallback(() => setIndex((i) => Math.min(total - 1, i + 1)), [total]);

  // Arrow keys only while presenting; browse mode is a normal scrollable page.
  useEffect(() => {
    if (!presenting) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [presenting, next, prev]);

  if (!id) return <p className="opacity-70">{tr("Ei materiaaleja vielä.")}</p>;

  const counter = `${tr("Dia")} ${index + 1} / ${total}`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xl font-bold">{title}</h3>
        <button
          type="button"
          onClick={() => setPresenting(true)}
          className="rounded-full bg-[color:var(--purple)] px-4 py-2 text-sm font-bold text-white shadow"
        >
          {tr("Näytä luokalle")}
        </button>
      </div>

      {/* Browse mode — every slide, scrollable */}
      <div className="space-y-4">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="space-y-1">
            <span className="font-mono text-xs opacity-70">
              {tr("Dia")} {i + 1}
            </span>
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-white shadow">
              <iframe
                src={slidesEmbedUrl(url, { lang, slide: i + 1 }) ?? undefined}
                title={`${title} — ${tr("Dia")} ${i + 1}`}
                loading="lazy"
                className="slide-viewer-iframe h-full w-full border-0"
                allowFullScreen
              />
            </div>
          </div>
        ))}
      </div>

      {presenting && (
        <PresentationOverlay
          index={index}
          total={total}
          counter={counter}
          onPrev={prev}
          onNext={next}
          onExit={() => setPresenting(false)}
        >
          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-white shadow-2xl">
            <iframe
              key={`present-${index}`}
              src={slidesEmbedUrl(url, { lang, slide: index + 1 }) ?? undefined}
              title={title}
              className="slide-viewer-iframe h-full w-full border-0"
              allowFullScreen
            />
          </div>
        </PresentationOverlay>
      )}
    </div>
  );
}
