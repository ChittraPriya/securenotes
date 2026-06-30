# Code Standards

## General
- Keep modules small and single-purpose — a file that handles both share-link generation and consumption logic should be split.
- Fix root causes, do not layer workarounds. If the race-condition fix requires restructuring a route handler, restructure it — don't add a retry loop on top of a flawed read-then-write pattern.
- Do not mix unrelated concerns in one component or route (e.g. don't put password-hashing logic inside a Next.js page component).
- Every non-trivial function should be explainable in one sentence by its name alone. If it can't, it's doing too much.

## TypeScript
- Strict mode is required throughout the project.
- Avoid `any` — use explicit interfaces or narrowly scoped types, especially for Prisma query results and API request/response shapes.
- Validate unknown external input (request bodies, query params, the `/share/[token]` token itself) at system boundaries before trusting it — use a schema validator (e.g. zod) at the API layer, not ad hoc `if` checks scattered through handlers.

## Next.js (App Router)
- Default to server components.
- Add `"use client"` only when browser interactivity requires it (forms, copy-to-clipboard, password input state).
- Keep route handlers focused on a single responsibility — auth check, then validation, then one business operation, then response.

## Styling
- Use CSS custom property tokens from `ui-context.md` — no hardcoded hex values anywhere in component code.
- Follow the border radius scale defined in `ui-context.md`.

## API Routes (Hono.js)
- Validate and parse request input before any logic runs.
- Enforce auth and ownership before any mutation (e.g. revoking a link checks the requester owns the parent note).
- Return consistent, predictable response shapes — `{ data }` on success, `{ error: { code, message } }` on failure, same shape across all routes.
- Any route that changes share-link state (consume, revoke) must use the atomic-update pattern described in `architecture.md` — never a separate findFirst-then-update.

## Data and Storage
- Metadata (note content, share link rules, view counts) belongs in PostgreSQL via Prisma — this project has no separate blob storage.
- Password/access keys are never stored in plaintext — only their hash (e.g. bcrypt) is persisted.
- Do not store the JWT secret, database URL, or any credential in source — `.env` only, and `.env` is gitignored.

## File Organization
- `app/` — routes and pages only, no business logic.
- `api/` — Hono route handlers; the only layer that imports Prisma directly.
- `lib/auth/` — JWT and password hashing utilities.
- `lib/share-link/` — share link generation, status check, and atomic consume logic.
- `components/ui/` — shadcn-generated components (protected, see ai-workflow-rules.md).
- `prisma/` — schema and migrations.
