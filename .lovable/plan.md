## PDF inspection

Re-parsed the uploaded workbook (lukiolaisten-vahvuusportfolio). Verified parsed pages 1–50; mapping uses the parsed-page index per your S1–S12 convention.

## Required fixes

**S7 (p7).** PDF page contains only three phrases: *"Tunnista omia vahvuuksia"*, *"Kehitä omia vahvuuksia"*, *"Hyödynnä omia vahvuuksia"*. Remove the invented one-liners and emoji captions; render three plain cards.

**S11 (p15).** PDF page is a pure title card *"1. Omat ydinvahvuudet"*. Strip the invented paragraph about "vahvuuskarkkeina"; keep only the Moduuli 1 label + title.

**S12 (p16–17).** Rebuild as the real activity:
- Verbatim instruction line from p16.
- 26 selectable statement cards, verbatim Finnish from p16 (preserving PDF text as-is).
- Enforce **exactly 5** picks. Selecting a 6th is blocked at the chip level.
- Persist as `screen_12_karkkikauppa_picks` (array of selected statement indices).
- After 5 picks are selected, reveal a panel showing the p17 strength list (26 names, same order as on p17) so the student can read off their matches. The PDF page-16 instruction explicitly tells students to "katso seuraavalta sivulta väittämiä vastaavat luonteenvahvuudet" — no added commentary, just the list.

## New screens 13–22

Each maps to one PDF page and uses only that page's text/tasks.

| App | PDF page | Title | Interactive content |
| --- | --- | --- | --- |
| 13 | p18 | Vahvuuskarkkini | 5 input slots ("Merkkaa tähän 5 vahvuuskarkkiasi") + 3 reflection textareas using the page's prompts verbatim |
| 14 | p19 | Ydinvahvuuksien tiekartta | 9 textareas, one per numbered PDF question |
| 15 | p20 | Voimavarani opiskelijana 1/2 | Informational (3 PDF bullets); no required input |
| 16 | p21 | Voimavarani opiskelijana 2/2 | 4 grouped textareas: KOULUSSA, VAPAA-AJALLA, KOTONA, KAVERISUHTEISSA |
| 17 | p22 | Haasteet ja vahvuudet | 3 textareas with the page's 3 prompts |
| 18 | p23 | Vahvuuksien käyttökielto | Lead-in verbatim + 2 textareas |
| 19 | p24 | Idea: Vahvuusjulisteet | Informational; the "KARIN" sample structure is the PDF's own example, displayed read-only |
| 20 | p25 | Muistele onnistumista | 4 textareas with the PDF's 4 prompts |
| 21 | p26 | Pohdi onnistumisia ja täydennä! | 8 sentence-stem textareas verbatim |
| 22 | p27 | Tulevaisuuden muistelu | 2 textareas with the PDF's 2 prompts |

Stop at S22. That covers the coherent "find your five → reflect → resources → challenge → poster idea → success memory → future memory" arc. Remaining module-1 pages (p28–p32: pair discussion, feedback starters, "Tässä olen minä", Govindji Likert) are the next batch — large enough to warrant their own pass.

Unbuilt screens 23+ already render the existing "rakennetaan seuraavissa erissä" placeholder, so navigation never lands on a broken page.

## Chrome / name fallback

`ScreenChrome` will always render a name with fallback order `display_name → email local-part → "Opiskelija"`. Layout stays inline (no `hidden md:flex`) so it remains visible at Chromebook landscape widths. `$screen.tsx` will fetch the email alongside `display_name` and pass both to the chrome.

## Completion gating

New module `src/lib/screen-completion.tsx` exports a React context and a `REQUIREMENTS: Record<number, string[]>` map (field keys required per screen). Inputs (ReflectionTextarea, ReflectionInput, SelectableChips) read the context and call `report(fieldKey, complete)` after their value loads and on each change. `$screen.tsx` aggregates reports into a Set, computes `isComplete = REQUIREMENTS[n]?.every(k => set.has(k)) ?? true`, and passes `nextDisabled` + `nextHint = "Täytä ensin tämän sivun tehtävä, niin pääset jatkamaan."` to `BottomNav`. Edellinen is never blocked. Pure info screens (1–5, 7, 11, 15, 19) have no entry → Seuraava always enabled. Saved/reloaded answers count because the report fires after load.

SelectableChips already supports `max`; `min` will be added for the screen-6 (≥1) and screen-12 (exactly 5) cases.

## Files

- New: `src/lib/screen-completion.tsx`
- Edit: `src/lib/screen-content.tsx` (S7/S11/S12 fixes + S13–S22 + a small karkkikauppa picker component)
- Edit: `src/components/ScreenChrome.tsx` (fallback name)
- Edit: `src/components/ReflectionTextarea.tsx` (report completion)
- Edit: `src/components/SelectableChips.tsx` (min + completion)
- Edit: `src/routes/_authenticated/seikkailu/$screen.tsx` (email fetch, completion context provider, gate Seuraava)

No DB, RLS, persistence-shape, or routing changes. No new components or libraries.

## Manual test checklist

1. `/seikkailu/1` → name top-right (display_name → email prefix → "Opiskelija"); no back button; Seuraava enabled.
2. S6: Seuraava disabled with helper text until ≥1 chip; persists on reload.
3. S8 / S9 / S10 / S13 / S14 / S16 / S17 / S18 / S20 / S21 / S22: Seuraava disabled until every required textarea has trimmed text; reloads count as complete.
4. S12: instruction visible, 26 cards from the PDF, 6th pick blocked, mapping panel appears after 5 picks; Seuraava unlocks at 5; reload preserves picks.
5. S15 and S19: Seuraava enabled immediately (info-only).
6. Student without class → `/liity-yhteisoon`; teacher → `/opettaja`.
7. Build/typecheck clean; no route conflicts; Chromebook landscape (≥1280×800) keeps name + progress + Seuraava on screen.

## Final report I'll produce

- PDF pages inspected and exact PDF→screen mapping.
- Fixes applied to S7/S11/S12.
- New screens S13–S22 with the PDF page each came from.
- Stop point + reason.
- Anything skipped (and why).
- Any temporary CSS recreations of PDF visuals.
- How completion gating was wired.
