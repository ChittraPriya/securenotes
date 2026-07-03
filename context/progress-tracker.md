# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase
All P0 and P1 issues from `current-issues.md` have been resolved including testing.

## Testing
- **Vitest configured** — vitest v4.1.9 installed with config at `vitest.config.ts`, tests directory at `tests/`, test excluded from Next.js build via tsconfig.
- **Unit tests** — 27 tests for `createShareLink`, `getShareLinkStatus`, `consumeShareLink`, `revokeShareLink` covering: valid token, expired, revoked, already-used one-time, wrong password, missing password, lockout after 5 attempts, failed attempt reset on success, concurrent consumes (only one succeeds), ownership check on revoke, and non-owner returns not_found.
- **API integration tests** — 14 tests covering: create → status → unlock → revoke lifecycle, 401/404/403/410/429/400 error responses for each endpoint, rate limiting on unlock, auth enforcement on create/revoke.
- **Scripts** — `npm test` (vitest run) and `npm run test:watch` (vitest watch) added.
- **Passing** — All 41 tests pass; `npm run build` passes.

## Completed
- Design system and UI primitives: shadcn/ui initialized with Radix/Lucide primitives, requested components installed, `lucide-react` installed, shared `cn()` helper added, and shadcn theme variables mapped to the Secure Notes light theme tokens.
- Editor chrome scaffolding: added reusable editor navbar, floating notes sidebar, and dialog content pattern per `context/feature-spec/02-editor.md`.
- Clerk auth pages: added `/login` and `/register` routes using `<SignIn />` and `<SignUp />`, custom Clerk appearance via CSS variables, and `ClerkProvider` in the root layout.
- Route protection: added root `middleware.ts` to allow unauthenticated access to public auth and share routes.
- Prisma models & client: added `prisma/models/notes.prisma`, duplicated models in `prisma/schema.prisma` for CLI compatibility, and exported a cached Prisma client at `lib/prisma.ts`. The share-link schema and migration were applied successfully.
- Backend notes/project API routes: added `GET /api/notes`, `POST /api/notes`, `PATCH /api/notes/[notesId]`, and `DELETE /api/notes/[notesId]` using the authenticated Clerk user ID as `ownerId`, defaulting new records to `Untitled Project`, returning `401` for unauthenticated requests, and returning `403` for non-owner rename/delete attempts.
- Editor home API wiring: the editor home page now fetches owned/shared projects server-side, passes them into the sidebar, and uses a project actions hook to create, rename, and delete projects through the real API with dialog state and workspace navigation.
- Editor workspace shell: added a server-rendered workspace route at `/editor/[id]` with reusable access helpers, an `AccessDenied` component for unauthorized or missing projects, and a full-viewport shell featuring the project title navbar, room sidebar, central canvas placeholder, and future AI sidebar placeholder.
- Workspace sharing: added `POST /api/share`, `GET /api/share/[token]`, `POST /api/share/[token]/unlock`, and `PATCH /api/share/[token]/revoke`; wired sharing controls into the existing notes workspace; added a share page at `/share/[token]` supporting public and password-protected access with revocation and view counting.

### P0 Issues (Verified Already Fixed)
- **Separate GET status check from consume**: `getShareLinkStatus()` is already a pure read-only function with no side effects. `GET /api/share/[token]` correctly uses it.
- **Auth + ownership check on revoke**: `revokeShareLink()` already verifies the requesting user owns the project. `PATCH /api/share/[token]/revoke` correctly calls `auth()` and passes `userId`.

### P1 Issues Resolved
1. **Add `.env.example`** — created with all required env vars (Clerk keys, redirect URLs, DATABASE_URL). File: `.env.example`.
2. **Fix dead redirect** — `app/notes/share/[token]/page.tsx` now redirects to `/share/${token}` instead of the non-existent `/share`. File: `app/notes/share/[token]/page.tsx`.
3. **Replace raw `<textarea>` with shadcn `<Textarea>`** — the raw HTML textarea in the create dialog now uses the installed shadcn `Textarea` component. Files: `components/editor/editor-home-page.tsx`.
4. **Strengthen password key generation** — changed from 6 hex chars (~24 bits) to `XXXX-XXXX` format using a 31-character alphabet (no ambiguous chars: I,O,U,0,1) with bias-safe random selection (~40 bits). File: `lib/share-link.ts`.
5. **Add brute-force protection** — added `failedAttempts` (INT, default 0) and `lockedUntil` (TIMESTAMP) columns to ShareLink. After 5 failed password attempts, the link locks for 15 minutes. Returns `locked` status from both GET status check and POST unlock. Files: `prisma/models/project.prisma`, `prisma/schema.prisma`, `prisma/migrations/20260703045927_add_brute_force_protection/`, `lib/share-link.ts`, `app/api/share/[token]/route.ts`, `app/api/share/[token]/unlock/route.ts`, `app/share/[token]/page.tsx`.
6. **Add rate limiting** — added in-memory rate limiter (30 req/min per IP) on the unlock endpoint. File: `lib/rate-limit.ts`, `app/api/share/[token]/unlock/route.ts`.
7. **Resolve Project vs Note model duality** — removed the orphaned `Note` model (never queried, only referenced in DELETE cleanup) and its relation from `Project`. Dropped the `Note` table from the database. Files: `prisma/models/notes.prisma` (deleted), `prisma/models/project.prisma`, `prisma/migrations/20260703051943_drop_note_model/`, `app/api/notes/[notesId]/route.ts`.

### Other Verified
- **Params type consistency**: All share routes (`GET /api/share/[token]`, `POST /api/share/[token]/unlock`, `PATCH /api/share/[token]/revoke`) consistently use `Promise<{ token: string }>` and `await params`.

## Architecture Decisions
- JWT secret has no fallback value - app throws on boot if `JWT_SECRET` is missing.
- Share link consumption uses a single atomic `updateMany` with `WHERE` conditions (not read-then-write).
- Password key generation uses a 31-char alphabet (no I,O,U,0,1) with bias-safe random selection.
- Brute-force protection uses lockout on the ShareLink record (5 failed attempts → 15 min lock).
- Rate limiting uses in-memory storage (per-process; not suitable for multi-instance without a shared store).
