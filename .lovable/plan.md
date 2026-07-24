# Multilingual extraction + localized routing

Two coordinated changes, executed in strict stages with per-stage verification:

- **Part A** — Extract every hardcoded Finnish string in `src/lib/screen-content.tsx` (~2 200 lines, screens 1–106) into the existing central i18n store, adding EN/SV placeholders.
- **Part B** — Migrate every user-facing route to `/{lang}/{slug}` with a canonical page-key model.
- **Part C** — Generate `content-inventory.md` from the hand-maintained i18n source.

Goal: **render-identical Finnish output** — same DOM, same classes, same whitespace, same screenshots — with all strings routed through `t()` and all routes prefixed by `lang`.

---

## Guardrails (apply to every stage)

1. **Baseline first.** Before any edit, capture for every screen 1–106 and every top-level route:
   - final URL
   - `document.body.innerText`
   - full-viewport screenshot at 1280×1800
   - console errors
   Store under `/tmp/browser/baseline/{route}/{n}.{png,txt,log}`. All later comparisons diff against this.
2. **Render-identical** ≠ innerText only. Verification also compares JSX hierarchy (element tag/order), `className` values, `<strong>`/`<br>`/list structure, whitespace around inline `t()` runs, console cleanliness, `bun run build` success, `bunx tsgo --noEmit` success.
3. **URL is authoritative for language.** The active language is derived from the URL segment. `localStorage`/Supabase preference is used only when entering `/` or a legacy unprefixed path. After a successful localized navigation, persist the preference. No pre-hydration flash of the stored language.
4. **Canonical page keys, never string replacement**, for language switching:
   ```ts
   type PageKey = "home" | "adventure" | "adventureScreen" | "teacher"
                | "joinCommunity" | "auth" | "authLogin"
                | "authStudent" | "authTeacher";
   ```
   Switch = `resolveLocalizedPath(pageKey, newLang, params, { search, hash })`. Preserve params, search, hash.
5. **Stop on drift.** Any diff — visual, structural, console, build — halts the stage until fixed.

---

## Stage 0 — Baseline capture

Playwright script that logs in as a seeded student, walks 1–106 and every public route, saves innerText + screenshot + console log per route. No source edits.

Report: routes captured, any pre-existing console errors (recorded, not fixed).

---

## Stage 1 — Route helper + tests

New file `src/lib/i18n/routes.ts` (extend existing) exposes:

```ts
export type PageKey = /* see above */;
export const SLUGS: Record<PageKey, Record<Language, string | null>>;
export function resolveLocalizedPath(
  page: PageKey, lang: Language,
  params?: Record<string, string>, extras?: { search?: string; hash?: string }
): string;
export function matchLocalizedPath(pathname: string):
  | { lang: Language; page: PageKey; params: Record<string, string> }
  | null;
```

Slug map (explicit, no inference):

| PageKey          | fi                 | en                | sv                        |
|------------------|--------------------|-------------------|---------------------------|
| home             | ""                 | ""                | ""                        |
| adventure        | seikkailu          | adventure         | aventyr                   |
| adventureScreen  | seikkailu/$screen  | adventure/$screen | aventyr/$screen           |
| teacher          | opettaja           | teacher           | larare                    |
| joinCommunity    | liity-yhteisoon    | join-community    | ga-med-i-gemenskapen      |
| auth             | auth               | auth              | auth                      |
| authLogin        | auth/login         | auth/login        | auth/login                |
| authStudent      | auth/student       | auth/student      | auth/student              |
| authTeacher      | auth/opettaja      | auth/teacher      | auth/larare               |

Note: `auth`, `auth/login`, `auth/student` intentionally share slugs across languages (technical segments). `authTeacher` is fully localized per requirement 6.

Unit tests (`src/lib/i18n/routes.test.ts`, `bunx vitest run`) cover: round-trip resolve→match, `$screen` param passthrough, search+hash preservation, unknown lang → `null`, unknown slug → `null`.

Report: helper + tests, all green.

---

## Stage 2 — Routing migration

**Decision: literal sibling route files, not `$lang/$slug`.**

Reason: the router is file-based, three routes have a `$screen` child (`seikkailu/$screen`, `adventure/$screen`, `aventyr/$screen`), the auth-gate lives at `_authenticated/route.tsx` and would need to move under `$lang` and re-establish its `beforeLoad`. A single `$lang/$slug` catch-all cannot express the nested `$screen` + protected subtree without an additional splat-and-route-again layer, which is more fragile than nine explicit prefixes.

Layout (flat dot convention — the project's current style):

```
src/routes/
  _authenticated/
    route.tsx                       # unchanged (gate + bearer)
    fi.seikkailu.route.tsx          # thin: import & re-export existing seikkailu/route.tsx
    fi.seikkailu.index.tsx
    fi.seikkailu.$screen.tsx
    en.adventure.route.tsx
    en.adventure.index.tsx
    en.adventure.$screen.tsx
    sv.aventyr.route.tsx
    sv.aventyr.index.tsx
    sv.aventyr.$screen.tsx
    fi.opettaja.tsx / en.teacher.tsx / sv.larare.tsx
    fi.liity-yhteisoon.tsx / en.join-community.tsx / sv.ga-med-i-gemenskapen.tsx
    fi.opettaja_.oppilas.$userId.tsx  (+ en, sv variants)
  fi.auth.index.tsx / en.auth.index.tsx / sv.auth.index.tsx
  fi.auth.login.tsx / en.auth.login.tsx / sv.auth.login.tsx
  fi.auth.student.tsx / en.auth.student.tsx / sv.auth.student.tsx
  fi.auth.opettaja.tsx
  en.auth.teacher.tsx
  sv.auth.larare.tsx
  index.tsx                          # detect lang, redirect to /{lang}
  seikkailu.$screen.tsx              # legacy → /fi/seikkailu/$screen (query + hash preserved)
  adventure.$screen.tsx              # legacy → /en/adventure/$screen
  aventyr.$screen.tsx                # legacy → /sv/aventyr/$screen
  seikkailu.tsx / adventure.tsx / aventyr.tsx (unchanged: legacy redirects)
  opettaja.tsx / teacher.tsx / larare.tsx (legacy redirects, page-key based)
  liity-yhteisoon.tsx / join-community.tsx / ga-med-i-gemenskapen.tsx (legacy)
```

Each localized route file is a **3-line re-export** of a shared page component in `src/features/<page>/Page.tsx`. Page code is moved once, not duplicated. Existing per-route components under `_authenticated/seikkailu/*` and `auth.*.tsx` become `src/features/*` modules with no logic changes.

**Language-from-URL sync.** A `useSyncLanguageFromUrl()` hook, mounted in `__root.tsx`, reads `matchLocalizedPath(location.pathname)`, and if lang differs from context, calls a new `setLanguageFromUrl(lang)` on `LanguageContext` that skips the Supabase write. On explicit user switch, use `setLanguage(lang)` (persists) and navigate via `resolveLocalizedPath(currentPageKey, newLang, currentParams, { search, hash })`.

**Legacy redirects.** Every legacy route computes `matchLegacy(pathname) → { page, params }`, then `throw redirect({ href: resolveLocalizedPath(page, resolvedLang, params, { search, hash }) })`. Search + hash preserved. Unsupported lang path (e.g. `/de/adventure/12`) falls through the 404 route, which resolves the page (if recognisable) to `fi` and redirects to the Finnish slug; unrecognisable → `/fi`.

**Link updates.** Replace every `<Link to="/seikkailu">`, `to="/opettaja">`, etc. with `<LocalizedLink page="adventure">` (a thin wrapper reading `language` from context and calling `resolveLocalizedPath`). Batch grep across `src/**` — no page code changes, only import + prop.

**Untouched:** `mcp.ts`, `.well-known`, `[.]lovable.oauth.consent.tsx`, `_authenticated/route.tsx`, `auth-middleware.ts`, `auth-attacher.ts`, all Supabase clients.

Verification:
- Full Playwright walk of all screens 1–106 in FI mode, diffed against Stage 0 baseline (innerText + screenshot).
- Auth flow: signup → join class → adventure, in FI, EN, SV.
- Language switch on `/fi/seikkailu/42` → `/en/adventure/42` → `/sv/aventyr/42`, params preserved.
- Legacy: `/seikkailu/12?x=1#y` → `/fi/seikkailu/12?x=1#y`; `/adventure/12` → `/en/adventure/12`; `/aventyr/12` → `/sv/aventyr/12`; `/de/adventure/12` → `/fi/seikkailu/12`.
- `bun run build` + `bunx tsgo --noEmit` green.

Report: routes changed, links updated, verification results.

---

## Stage 3 — Part A prep: i18n architecture confirmation

Before touching `screen-content.tsx`:

- Confirm hand-maintained source = `src/lib/i18n/strings.ts` (flat dotted keys, `Record<string, Record<Language, string>>`).
- Confirm `translations-generated.json` is Excel-derived content dictionary keyed by FI source; not regenerated by any build step in this repo.
- Confirm consumer: `useT()` in `src/lib/i18n/index.tsx` (chrome), `tFi()` for content lookup via FI source. New screen keys go through `t("screen.N.slot")`, added to `STRINGS` in `strings.ts` and wired via `useT()` — same shape as existing chrome keys. **No architecture change.**
- Locale parity is not currently compile-time checked; extraction script + inventory generator enforce parity by construction.

Report: confirmed architecture, key-naming convention:

```
screen.<n>.title
screen.<n>.intro.p1
screen.<n>.chip.<index>          // ordered as authored
screen.<n>.field.<name>.label
screen.<n>.field.<name>.placeholder
screen.<n>.helper
screen.<n>.button.<name>
```

Slot names are *semantic*, not sentence-derived. Duplicates in current FI text are extracted to distinct keys (they may translate differently); the inventory flags them for future de-duplication.

---

## Stage 4..N — Screen extraction, one module at a time

Modules from `src/lib/screens.ts`:

| Stage | Module        | Screens |
|-------|---------------|---------|
| 4     | Prologi       | 1–4     |
| 5     | Maailma 1     | 5–15    |
| 6     | Maailma 2     | 16–26   |
| 7     | Maailma 3     | 27–37   |
| 8     | Maailma 4     | 38–48   |
| 9     | Maailma 5     | 49–59   |
| 10    | Maailma 6     | 60–70   |
| 11    | Mittari       | 71–100  |
| 12    | Aarre         | 101–106 |

Per-stage rules:

- Preserve component tree, props, `className`, element order, fragments, `<strong>`, `<br>`, `<ul>`/`<ol>`, paragraph boundaries.
- Replace **only literal text runs** with `t("screen.N.slot")`. No JSX refactor. No merging text into HTML strings. No `dangerouslySetInnerHTML`.
- Inline `<strong>` inside a paragraph = split into sibling `t()` calls with explicit `{" "}` where the original had whitespace. Explicitly checked in verification.
- Add every new key to all three `fi` / `en` / `sv` maps in `strings.ts`. FI = verbatim current source. EN = `"[EN translation needed]"`. SV = `"[SV translation needed]"`. Never silently fall back.
- Runtime-interpolated text uses `tFormat("screen.N.slot", { … })`.
- After the edit: Playwright walks every screen in the module, diffs innerText + screenshot against baseline, checks console, runs `bun run build` + `bunx tsgo --noEmit`.

Report per stage: files touched, key count added, screens diffed, drift found.

---

## Stage 13 — Inventory generation

Node script under `scripts/build-inventory.ts` reads `strings.ts` + `screens.ts` + `LOCALIZED_PATHS` and writes `content-inventory.md` with:

- **Screens** — one table per module, columns: `key | fi | en | sv | source file | screen # | notes | status` (Markdown pipes and newlines escaped).
- **Chrome** — same shape for common/auth/teacher/nav.
- **Routes** — canonical page keys × language slugs table.
- **Runtime-interpolated strings** — flagged by presence of `{…}` placeholders.
- **Unextractable strings** — anything skipped during Stage 4–12 (should be empty; explicit list if not).
- **Duplicate FI values** — same value under different keys.
- **Likely unused keys** — no reference in `src/**` via `rg`.
- **Images with text** — three separate lists:
  1. SVGs containing an actual `<text>` element (grep result).
  2. Assets whose filename or usage suggests embedded text (manual heuristic, listed with reasoning).
  3. Raster images requiring manual visual inspection (listed by path — **not** claimed as automatically detected).

---

## Stage 14 — Full final comparison

Re-run the Stage 0 walk across all 106 screens + every top-level route in FI. Zero visual, structural, or console diffs required. Repeat abbreviated walk in EN and SV to confirm placeholders render where expected and layout doesn't break (CSS min/max widths, flex wrap, textarea scroll, sticky `BottomNav` clearance).

Final report: files created, files modified, total key count, screens+routes verified, images containing text, unresolved risks, confirmation Finnish output is unchanged.

---

## Layout-safety notes (no design changes)

Because EN/SV are typically longer than FI, during Stage 14 the abbreviated EN/SV walk explicitly checks:

- Buttons and chips: `flex-wrap` present or content within existing min-width.
- Titles: no forced single-line where translation might wrap.
- Textareas: existing `scroll-padding-bottom` clearance below `BottomNav`.
- Sidebar labels: truncation preserved.

Any risk is logged in the inventory under "Layout risks for EN/SV" — not fixed in this pass unless it breaks FI rendering.

---

## Explicit non-goals

- No visual redesign, spacing, color, animation, or component API changes.
- No rewording of Finnish source.
- No changes to RLS, DB schema, Supabase clients, auth middleware, MCP.
- No image editing or OCR of raster assets.
- No auto-translation of EN/SV values.
