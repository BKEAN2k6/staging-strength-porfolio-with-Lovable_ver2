## Plan: Alignment fix + Vahvuusmittari + Progress sync & teacher portfolio

This is three phases. I'll ship them in order so each can be reviewed independently.

---

### Phase 1 — Alignment & input rendering fix (touches every screen)

Symptoms in the current build:
- Sticky-note cards use `transform: rotate(...)` per-card, which makes text and adjacent inputs visually drift.
- `ReflectionTextarea` wraps the textarea in `.workbook-paper` but the textarea also has its own `rounded-[1.25rem]`, double border feel and inconsistent padding.
- `ReflectionInput` is a pill (full rounded), not aligned with paper textarea — inconsistent inside the same card.
- Labels float above paper at a different left-inset than the paper's inner text.

Fix:
1. **StickyNote**: drop per-card `rotate()` from content cards. Keep a tiny rotation only on a decorative class `sticky-note--scrap` for purely decorative tags. Add consistent inner padding (`p-6 md:p-7`) and a single left rhythm (`space-y-4`).
2. **`.workbook-paper`**: keep ruled paper but standardize padding inside (`px-4 py-3`), unify border-radius `1rem`, single border, no nested rounded on the `<textarea>`. Textarea becomes a flush child filling the paper.
3. **`ReflectionInput`**: switch from pill to a small paper line (matches textarea visually) so labels + inputs share the same left edge and baseline.
4. **Label rhythm**: labels use the same left padding as the paper inner content (no negative offset). Replace the emoji prefix with a small left-aligned bullet to keep alignment crisp.
5. Pass through `align-left` everywhere; remove stray `text-center` inside content blocks.
6. Spot-check 4 screens (S12 candy, S13 textareas, S26 Likert, S63 current) via Playwright screenshots to confirm.

---

### Phase 2 — Vahvuusmittari (screens 77–106), game-style

Extend `TOTAL_SCREENS` from 70 → 106 and add a 7th world `m7 "Vahvuusmittari"` covering 71–106. Screens 71–76 already conceptually fit in M6; I'll keep M6 ending at 76 (workbook closes there) and put the mittari at 77–106 per your spec.

Content source of truth: the 26 strengths and their 2-statement pairs from the workbook's Vahvuusmittari pages. I'll extract them from the uploaded PDF and store them in `src/lib/meter-data.ts` as `{ id, name, virtue, statements: [{text, reversed?}, {text, reversed?}] }`. No invented wording.

Interaction:
- **S77–S102** (26 strength screens): one strength per screen. Big strength name + virtue chip. Two statement cards stacked. Each card has a 1–5 candy-style picker (5 large round chips, tap to select, satisfying pop animation). Live tally at top: `Vahvuuden pisteet: X/10`.
- Auto-save each statement answer as `meter2_<strengthId>_s1` / `_s2` via the existing `useAutosave`.
- **S103**: Virtue subtotals grid (6 cards: Viisaus, Rohkeus, Inhimillisyys, Oikeudenmukaisuus, Kohtuullisuus, Hengellisyys), each showing sum + bar.
- **S104**: Auto Top-5 core (score 9–10, ties broken by virtue order) + Bottom-3 growth, friendly interpretation line per the workbook tone.
- **S105**: Editable confirmation — 26 chips, pre-checked Top 5; second block pre-checks Bottom 3. Saves to `meter2_top5` and `meter2_growth3`.
- **S106 (climax)**: "Vahvuustulos" reveal comparing candy-shop picks (`screen_12_karkkikauppa_picks`) vs measured Top 5, overlap highlighted, celebratory confetti, and a badge "Vahvuusmittari suoritettu".

All driven by a single `useMeter2()` hook that reads/writes `responses` rows.

---

### Phase 3 — Live WorldMap progress + Teacher portfolio view

**Student WorldMap (`/seikkailu`)**:
- Add `src/lib/progress.ts` `useStudentProgress()` — single subscription that loads all `responses` rows for the current user, plus a realtime channel on `responses` filtered by `user_id`, so the map updates as autosave fires.
- Use the existing `REQUIREMENTS` map from `screen-completion.tsx` as the source of "done" per screen. A world is complete when every required field in its range is filled.
- World stop renders one of: `locked` (previous world not complete), `current` (in-progress), `completed` (badge shown).
- Visual: keep current map but add a small progress ring per stop (`x/y screens`).

**Teacher view (`/opettaja/oppilas/$userId`)**:
- New route. Loader fetches all `responses` for the student via a `createServerFn` with `requireSupabaseAuth` + `is_teacher_of(studentId)` check.
- Page renders read-only portfolio grouped by world → screen, plus a Vahvuustulos section when meter is done.
- "Tulosta Portfolio" button: triggers `window.print()`; print stylesheet hides chrome and unfolds all sections.
- Link added from `/opettaja` class roster.

No RLS or schema changes — responses table already keyed by `user_id`; the `is_teacher_of` SECURITY DEFINER function already exists. I'll just add a new server fn that uses it for fetching.

---

### Technical notes

- New files: `src/lib/meter-data.ts`, `src/lib/meter.ts` (scoring), `src/components/MeterPicker.tsx`, `src/lib/progress.ts`, `src/routes/_authenticated/opettaja.oppilas.$userId.tsx`, `src/lib/portfolio.functions.ts`.
- Edits: `StickyNote.tsx`, `ReflectionTextarea.tsx`, `styles.css`, `screens.ts` (TOTAL_SCREENS=106, m7 world, S71–S76 either trimmed or left as workbook conclusion), `screen-content.tsx` (S77–S106 registry), `screen-completion.tsx` (requirements for meter), `seikkailu/index.tsx` (map), `opettaja.tsx` (student links).
- Realtime requires `ALTER PUBLICATION supabase_realtime ADD TABLE public.responses` — a one-line migration.
- No new tables. All meter answers stored in the existing `responses` table as `field_key` rows.

### Risks / things to confirm

- **PDF coverage of mittari statements**: I'll extract verbatim. If the uploaded PDF doesn't contain a particular statement, that statement screen will surface a "PDF page missing — needs source" placeholder rather than be invented.
- **S71–S76**: workbook M6 ends at 70 in current setup; you said meter starts at 77. I'll insert S71–S76 as the workbook's actual M6 closing pages if present in the PDF; otherwise leave them as the current S65–S70 contents shifted, and meter still runs 77–106.
- Completion gating remains disabled (per previous turn). Map progression still computes "complete" so the visuals work.