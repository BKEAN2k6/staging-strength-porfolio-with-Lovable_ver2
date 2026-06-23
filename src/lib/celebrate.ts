// CSS-only save-celebration. No JS animation libraries.
// Mounts a checkmark element for ~300ms, then cleans up.
// Safe to call from event handlers; respects prefers-reduced-motion.

const ANIM_MS = 300;

export function celebrateSave(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve();
      return;
    }
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      resolve();
      return;
    }
    const el = document.createElement("div");
    el.className = "celebrate-check";
    el.setAttribute("aria-hidden", "true");
    el.textContent = "✓";
    document.body.appendChild(el);
    window.setTimeout(() => {
      el.remove();
      resolve();
    }, ANIM_MS);
  });
}
