/**
 * @lovable-new 2026-08-05
 * Custom Google Slides viewer: one slide at a time inside the app, with our
 * own navigation and an in-app fullscreen presentation mode (no external tab).
 */
import { useCallback, useEffect, useState } from "react";
import { PresentationOverlay } from "@/components/teach/PresentationOverlay";
import { slidesEmbedUrl } from "@/lib/google-slides";
import { useTr } from "@/lib/i18n";

const MAX_SLIDES = 200;

export function SlideViewer({
  url,
  title,
  lang,
  slideCount,
}: {
  url: string | null | undefined;
  title: string;
  lang: "fi" | "en" | "sv";
  /** Optional known deck length; when unknown the counter hides the total. */
  slideCount?: number | null;
}) {
  const tr = useTr();
  const [index, setIndex] = useState(0);
  const [presenting, setPresenting] = useState(false);

  const total = slideCount && slideCount > 0 ? slideCount : MAX_SLIDES;
  const src = slidesEmbedUrl(url, { lang, slide: index + 1 });

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const next = useCallback(
    () => setIndex((i) => Math.min(total - 1, i + 1)),
    [total],
  );

  // Keyboard navigation while the inline viewer is on screen. The overlay
  // handles its own keys, so stay out of the way while presenting.
  useEffect(() => {
    if (presenting) return;
    function onKey(e: KeyboardEvent) {
      const el = document.activeElement as HTMLElement | null;
      const typing =
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.isContentEditable);
      if (typing) return;
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

  if (!src) return <p className="opacity-70">{tr("Ei materiaaleja vielä.")}</p>;

  const counter =
    slideCount && slideCount > 0
      ? `${tr("Dia")} ${index + 1} / ${slideCount}`
      : `${tr("Dia")} ${index + 1}`;

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

      {/* Only one viewer exists at a time: the inline one steps aside while
          the fullscreen presentation is open. */}
      {!presenting && (
        <>
          <div className="aspect-video w-full overflow-hidden rounded-2xl bg-white">
            <iframe
              key={`inline-${index}`}
              src={src}
              title={title}
              className="slide-viewer-iframe h-full w-full border-0"
              allowFullScreen
            />
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={prev}
              disabled={index <= 0}
              className="rounded-full bg-white/85 px-4 py-1.5 text-sm font-bold text-slate-900 shadow disabled:opacity-40"
            >
              {tr("Edellinen")}
            </button>
            <span className="font-mono text-sm opacity-85">{counter}</span>
            <button
              type="button"
              onClick={next}
              disabled={index >= total - 1}
              className="rounded-full bg-white/85 px-4 py-1.5 text-sm font-bold text-slate-900 shadow disabled:opacity-40"
            >
              {tr("Seuraava")}
            </button>
          </div>
        </>
      )}

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
              src={src}
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
