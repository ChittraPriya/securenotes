# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase
P0 and P1 issues resolved. P2 — Collaborator management, editor workspace, and seed script are complete.

## Testing
- **Vitest configured** — vitest v4.1.9 installed with config at `vitest.config.ts`, tests directory at `tests/`, test excluded from Next.js build via tsconfig.
- **Unit tests** — 27 tests for `createShareLink`, `getShareLinkStatus`, `consumeShareLink`, `revokeShareLink` covering: valid token, expired, revoked, already-used one-time, wrong password, missing password, lockout after 5 attempts, failed attempt reset on success, concurrent consumes (only one succeeds), ownership check on revoke, and non-owner returns not_found.
- **API integration tests** — 26 tests covering: share link lifecycle (14 tests) + collaborator API (12 tests for GET/POST/DELETE with auth, ownership, validation, and conflict scenarios).
- **Scripts** — `npm test` (vitest run) and `npm run test:watch` (vitest watch) added.
- **Passing** — All 53 tests pass; `npm run build` passes.

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
- Collaborator management (P2): added `addCollaboratorSchema` and `removeCollaboratorSchema` to `lib/schemas.ts`; created `GET/POST/DELETE /api/notes/[notesId]/collaborators` with auth, ownership, and email validation; created `WorkspaceCollaborators` UI component for add/list/remove; wired into both `notes/[notesId]` and `editor/[id]` pages with owner-only guard.
- Editor workspace (P2): replaced the placeholder canvas in `/editor/[id]` with a functional `WorkspaceEditor` client component featuring an editable content textarea with debounced autosave (1.5s), save-status indicator in the header, embedded `WorkspaceSharing` and `WorkspaceCollaborators` panels, a collapsible AI chat sidebar with message history and input, and a footer showing created/updated timestamps. The server page now fetches `content`, `shareLinks`, and `collaborators` in parallel and passes them as props.
- Prisma seed script (P2): created `prisma/seed.ts` — creates 3 demo projects (Getting Started Guide, Architecture Notes, Meeting Notes), 3 share links on the first project (one-time public, time-based public, password-protected), and 1 collaborator. Idempotent (skips if seed data already exists). Configured via `migrations.seed` in `prisma.config.ts`. Requires `SEED_USER_ID` env var. Updated `.env.example` and README with setup instructions, corrected schema docs, and removed outdated User/Note model references.

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

### P2 Tasks Remaining (5th Task)
- **Next.js error boundary components for share link pages**: Added `app/share/[token]/error.tsx` and `app/notes/share/[token]/error.tsx`. Both use `"use client"`, match the existing share page design tokens (`bg-bg-base`, `border-border-default`, `accent-primary`, etc.), display user-friendly fallback UI with an error description, error digest reference, and a "Try again" button wired to `reset()`. The main share page error covers unexpected failures during share link loading; the legacy redirect error covers failures during the redirect to the canonical URL.

## Architecture Decisions
- JWT secret has no fallback value - app throws on boot if `JWT_SECRET` is missing.
- Share link consumption uses a single atomic `updateMany` with `WHERE` conditions (not read-then-write).
- Password key generation uses a 31-char alphabet (no I,O,U,0,1) with bias-safe random selection.
- Brute-force protection uses lockout on the ShareLink record (5 failed attempts → 15 min lock).
- Rate limiting uses in-memory storage (per-process; not suitable for multi-instance without a shared store).
- Zod v4 is used for API input validation. Schemas live in `lib/schemas.ts` and use `.catch()`/`.default()` for graceful fallback on create routes, `.safeParse()` with 400 response for update/unlock/share routes.
- Collaborators are email-based (no userId link), with a unique constraint on `[projectId, collaboratorEmail]` to prevent duplicates. Only the project owner can add or remove collaborators.
