/**
 * @lovable-new 2026-08-04
 * Google Slides link helpers — turn a pasted share/edit link into the
 * embeddable and presentation URLs used by the Teaching Materials section.
 */

/** Extracts the presentation id from any Google Slides URL. */
export function slidesId(url: string | null | undefined): string | null {
  if (!url) return null;
  const m = /presentation\/d\/([a-zA-Z0-9_-]+)/.exec(url);
  if (m) return m[1];
  // Already a bare id?
  if (/^[a-zA-Z0-9_-]{20,}$/.test(url.trim())) return url.trim();
  return null;
}

export function slidesEmbedUrl(url: string | null | undefined): string | null {
  const id = slidesId(url);
  return id
    ? `https://docs.google.com/presentation/d/${id}/embed?start=false&loop=false&delayms=3000`
    : null;
}

export function slidesPresentUrl(url: string | null | undefined): string | null {
  const id = slidesId(url);
  return id ? `https://docs.google.com/presentation/d/${id}/present` : null;
}
