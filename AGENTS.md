# AGENTS.md

Instructions for any AI coding agent (Claude Code, Cursor, etc.) working in this repository. This file is the entry point — read it first, then read the referenced context files before writing any code.

## Project
Secure Notes — a secure note-sharing app with expiring, access-controlled share links. Full spec lives in `product-overview.md`. This is a deliberate rebuild of a prior POC; the priority is correctness and explainability over speed.

## Required Reading Before Any Change
1. `product-overview.md` — what the product does and its scope boundaries.
2. `architecture.md` — stack, data model, system boundaries, and invariants.
3. `ui-context.md` — design tokens and layout patterns.
4. `code-standards.md` — language/framework conventions.
5. `progress-tracker.md` — current state; check this before starting work so you don't redo or conflict with completed units.

Do not infer or invent product behavior that isn't defined in these files. If something is ambiguous, stop and flag it as an open question in `progress-tracker.md` rather than guessing.

## Stack Summary
Next.js (App Router) + TypeScript, Hono.js for API routes, PostgreSQL + Prisma, shadcn/ui + Tailwind, JWT auth via httpOnly cookie. Full details in `architecture.md`.

## Non-Negotiable Invariants
These are not style preferences — violating them is a failed change regardless of whether tests pass:

1. **No fallback secrets.** `JWT_SECRET` (and any other secret) must be read from `process.env` only. Never write `process.env.JWT_SECRET || "some-default"`. Missing env var = throw at boot, not a silent insecure fallback.
2. **Atomic share-link state changes.** Any operation that checks a share link's validity and then changes its state (consume, mark used, increment view count) must happen in a single atomic database call — a `WHERE`-conditioned `updateMany`, not a separate read-then-write. This is what prevents two concurrent requests from both succeeding on a one-time link. Never implement this as `findFirst` followed by a separate `update`.
3. **View count only increments as a side effect of a successful atomic consume** — never via a standalone increment call.
4. **Validate all external input** at the API boundary (Hono routes) before any logic runs.
5. **Ownership checks before mutation** — only a note's owner can create/revoke its share links.

## Scoping Rules
- One feature unit per change (e.g. "share link generation" and "share link consumption" are separate units).
- Don't combine UI changes with API/business-logic changes in the same step.
- Don't touch multiple unrelated API routes in one change.
- If a change can't be verified end to end quickly, it's too broad — split it.

## Protected Files
Do not modify without explicit instruction:
- `components/ui/*` — generated shadcn components.
- Applied Prisma migrations — create new migrations, don't edit history.
- `node_modules` or other third-party internals.

## File Organization
- `app/` — routes/pages only, no business logic.
- `api/` — Hono route handlers; the only layer that imports Prisma directly.
- `lib/auth/` — JWT and password hashing.
- `lib/share-link/` — share link generation, status check, atomic consume.
- `components/ui/` — protected, shadcn-generated.
- `prisma/` — schema and migrations.

## Definition of Done (per unit)
1. Works end to end within its defined scope.
2. No invariant above is violated.
3. `progress-tracker.md` updated to reflect the change.
4. `npm run build` passes.
5. The change is explainable in plain language, not just functional — this project is being audited for understanding, not just output.

## After Finishing a Unit
Update `progress-tracker.md`: move the item from "Next Up" to "Completed," note any architecture decisions made, and log open questions if anything was left ambiguous.
