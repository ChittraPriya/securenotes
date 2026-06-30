# Progress Tracker

Update this file after every meaningful implementation change.

## Current Phase
Editor chrome setup complete.

## Current Goal
Set up the project skeleton: Next.js App Router + TypeScript, Hono.js mounted as the API layer, Prisma + PostgreSQL connection, shadcn/ui installed and themed per `ui-context.md`.

## Completed
- Design system and UI primitives: shadcn/ui initialized with Radix/Lucide primitives, requested components installed, `lucide-react` installed, shared `cn()` helper added, and shadcn theme variables mapped to the Secure Notes dark-only tokens.
- Editor chrome scaffolding: added reusable editor navbar, floating notes sidebar, and dialog content pattern per `context/feature-spec/02-editor.md`.

## In Progress
- None yet.

## Next Up
1. Project scaffold (Next.js, TS, Tailwind, shadcn init, Hono mount point).
2. Prisma schema: `User`, `Note`, `ShareLink` models per `architecture.md`.
3. Auth: register/login routes, JWT signing with no fallback secret, httpOnly cookie session.
4. `/notes/new` - note creation form + API route.
5. Share link generation - token, password/key generation, share/access type selection.
6. `/share/[token]` - status-check endpoint + atomic consume endpoint.
7. Revoke link flow.
8. View count display on `/notes/[id]`.
9. Edge case pass: invalid/expired/revoked/used/wrong-password states.
10. Concurrency test: simulate two simultaneous requests to a one-time link.
11. README write-up (setup, schema, flows, race-condition answers).
12. Demo video recording.

## Open Questions
- Password/key generation: confirm length and character set for the dynamic access key (e.g. 8-character alphanumeric vs longer token) - needs a decision in `product-spec.md` before building.
- Rate limiting on password attempts for `/share/[token]` - POC requirements ask "how would you prevent brute-force" in the README; decide whether to actually implement basic rate limiting or only answer it conceptually.

## Architecture Decisions
- JWT secret has no fallback value - app throws on boot if `JWT_SECRET` is missing. Decided after the prior submission's interview surfaced `process.env.JWT_SECRET || "dev-secret-change-me"` as a security gap.
- Share link consumption uses a single atomic `updateMany` (status check + state change in one query) rather than separate read-then-write calls, specifically to prevent two concurrent requests from both succeeding on a one-time link.
- UI theme is dark-only at `:root`: shadcn's semantic variables (`--background`, `--card`, `--border`, etc.) are aliases to the named Secure Notes tokens, so components do not fall back to shadcn's default light palette when no `.dark` class is present.
- Notes sidebar is a fixed-position overlay (`translate-x` slide-in) so opening it does not push or reflow the editor canvas.
- Notes sidebar receives the signed-in user's owned notes as props for now; auth/database-backed loading belongs to a later API/data unit.

## Session Notes
- This is a deliberate rebuild of an earlier POC for Peacock India. The MD gave a second chance after the CEO flagged that the build was strong but the explanation wasn't. The bar this time is verbal fluency on: the share-link two-step flow, the DB relationships, the JWT fallback fix, and the atomic update pattern - not just a working demo.
- `AGENTS.md` references `context/product-overview.md`, but the repository currently contains the same required overview context as `context/project-overview.md`.
- Design-system verification: `npm run build` passes. The first build hit stale `.next` output from the CLI prompt flow; clearing generated `.next` cache fixed it.
- `ui-context.md` now specifies light/dark theme support, while the prior design-system tracker entry records a dark-only implementation. Treat theme alignment as a separate follow-up unit; this editor chrome pass stays scoped to `02-editor.md`.
- Editor chrome verification: `npm run lint` and `npm run build` pass.
- Git status shows the project source files as untracked because the repository's first commit only included `README.md`.
