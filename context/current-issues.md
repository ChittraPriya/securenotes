# SecureNotes — Improvements Todo

Priority: **P0** = ship-blocking, **P1** = should fix, **P2** = nice to have

---

## P0 — Critical Bugs

- [x] **Separate GET status check from consume.** `getShareLinkAccess()` in `lib/share-link.ts` currently performs the atomic consume on every call. Create a side-effect-free function for status checks (used in GET /api/share/[token]) and keep the consume operation only in POST /api/share/[token]/unlock.
- [x] **Add auth + ownership check to revoke endpoint.** `app/api/share/[token]/revoke/route.ts` and `revokeShareLink()` in `lib/share-link.ts` need to verify the requesting user is the note owner before allowing revocation.

---

## P1 — Should Fix

- [x] **Resolve Project vs Note model duality.** Decide whether the entity is a "Project" or a "Note". If Notes, drop the Project model and migrate. If Projects, rename API routes and UI references to match. The orphaned `Note` model and never-queried `content` field on Project indicate an incomplete refactoring.
- [x] **Add `.env.example`** with all required env vars so README setup instructions actually work.
- [x] **Fix dead redirect.** `app/notes/share/[token]/page.tsx` redirects to `/share` which doesn't exist. Remove the file or fix the target route.
- [x] **Fix `params` type inconsistency.** `GET /api/share/[token]` and `POST /api/share/[token]/unlock` use `{ params }: { params: { token: string } }` but await it. `revoke/route.ts` uses `Promise<{ token: string }>` correctly. Make them consistent.
- [x] **Replace raw `<textarea>` with shadcn `<Textarea>` component.** In `components/editor/editor-home-page.tsx` line 140, the raw HTML textarea should use the installed shadcn component.

---

## P1 — Missing Features (Documented but Not Built)

- [x] **Add brute-force protection on password unlock.** Implement `failedAttempts` counter and `lockedUntil` timeout on the ShareLink model as described in the README. Track attempts before returning `invalid_password`.
- [x] **Strengthen password key generation.** Spec describes 8-character `XXXX-XXXX` format with 31-char alphabet (~40 bits). Current implementation uses 6 hex chars (~24 bits). Align with spec.
- [x] **Add rate limiting.** As documented in the README, add rate limiting to share link endpoints.

---

## P1 — Testing

- [x] **Set up a testing framework** (Vitest) in the project.
- [x] **Write unit tests for share-link logic** — `createShareLink`, `getShareLinkStatus`, `revokeShareLink`, `consumeShareLink`. Cover: valid token, expired, revoked, already-used one-time, wrong password, concurrent consumes.
- [x] **Write API route integration tests** — share link lifecycle (create → status check → unlock → consume → revoke).
- [x] **Verify `npm run build` passes after all changes** (already passing, but don't break it).

---

## P2 — Nice to Have

- [x] **Add zod input validation** at API boundaries as specified in `code-standards.md`. Replace manual `typeof` checks.
- [x] **Implement collaborator UI.** The `ProjectCollaborator` model exists in the schema but there's no UI or API to manage collaborators.
- [x] **Flesh out the editor workspace.** `/editor/[id]` is currently a placeholder shell. The AI sidebar shows placeholder text.
- [x] **Add a seed script** so `npx prisma db seed` works as the README advertises.
- [x] **Add error boundary components** for share link pages (graceful fallbacks instead of blank pages on unexpected errors).

---

## After Each Change

1. Verify `npm run build` still passes.
2. Update `progress-tracker.md` if it's being maintained.
3. Don't modify `components/ui/*` (shadcn generated), `node_modules`, or applied migration history.
