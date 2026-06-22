## Minimal `/opettaja` stub

Throwaway scaffold so the join flow is testable end-to-end through the UI. Will be replaced by the real dashboard in Batch 11.

### Scope
Edit only `src/routes/_authenticated.opettaja.tsx`. No new components, no DB changes (the `classes` table, RLS, and the `join_class` RPC are already in place).

### Behavior
1. On mount, verify role is `teacher` (existing check stays); non-teachers bounce to `/seikkailu`.
2. Load the teacher's existing classes: `select id, name, join_code, created_at from classes where teacher_id = auth.uid()` — RLS already enforces this.
3. Show a small form: text input for class name + "Luo luokka" button.
   - On submit: insert `{ name, teacher_id: auth.uid(), join_code }` where `join_code` is generated client-side as a short readable string (e.g. `LK-{4 base32 chars}-{2 digits}`, uppercased), then re-fetch the list.
   - If insert fails with a unique-code collision (rare), retry once with a new code.
4. List each class as a sticky note showing the name, the join code in a large mono badge, and a "Kopioi koodi" button (`navigator.clipboard.writeText`).
5. Keep the existing top-of-page header and sign-out.

### Out of scope (Batch 11)
- Viewing student rosters or portfolios.
- Regenerating or revoking join codes.
- Renaming / deleting classes.
- Copying a full `/liity?code=…` invite link.
- Read-only student-portfolio view.
- Pretty layout / sidebar.

### Testing checklist this unlocks
- Sign up teacher with code `OPETTAJA-2026` → land on `/opettaja`.
- Create a class → join code appears, copy button works.
- In incognito, sign up as student → `/liity-yhteisoon` → paste code → land on `/seikkailu` WorldMap.
- Verify the join-gate: sign up a second student, close tab before joining, log back in → lands on `/liity-yhteisoon`.
- Open a screen, click around the sidebar, sign out, sign back in → resumes at highest visited screen.

### Technical notes
- Client-side code generation is fine for a stub. The `classes.join_code` column has a unique index already; on collision we retry with a fresh code. The owner-verify rotation lives in the real Batch 11 dashboard.
- All strings Finnish.