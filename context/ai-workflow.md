# AI Workflow Rules

## Approach
Build this project incrementally using a spec-driven workflow. The context files (`product-spec.md`, `architecture.md`, `ui-context.md`, `code-standards.md`) define what to build, how to build it, and current state. Always implement against these specs — do not infer or invent behavior from scratch. The goal of this rebuild is not faster output than last time; it is the ability to explain every decision made. After any AI-generated change, the change must be read and understood line by line before moving on — not just tested for "does it run."

## Scoping Rules
- Work on one feature unit at a time (e.g. "share link generation" is a separate unit from "share link consumption").
- Prefer small, verifiable increments over large speculative changes.
- Do not combine unrelated system boundaries in a single implementation step (e.g. don't build auth and share-link logic in the same prompt/change).

## When to Split Work
Split an implementation step if it combines:
- UI changes and API/business-logic changes.
- Multiple unrelated API routes (e.g. note CRUD and share-link consume).
- Behavior not clearly defined in the context files — stop and resolve the ambiguity first.

If a change cannot be verified end to end quickly, the scope is too broad — split it.

## Handling Missing Requirements
- Do not invent product behavior not defined in the context files.
- If a requirement is ambiguous, resolve it in `product-spec.md` or `architecture.md` before implementing.
- If a requirement is missing, add it as an open question in `progress-tracker.md` before continuing.

## Protected Files
Do not modify the following unless explicitly instructed:
- `components/ui/*` — generated shadcn UI library components.
- `prisma/schema.prisma` migrations once applied — generate new migrations rather than editing history.
- Any third-party library internals in `node_modules`.

## Mandatory Self-Audit Before Accepting AI Code
Before marking any unit complete, manually verify:
- **Auth/secrets**: no fallback values for secrets (the `JWT_SECRET ||` pattern is explicitly banned — see architecture.md invariant 2).
- **Concurrency**: any share-link state change uses a single atomic `updateMany` with validity conditions in the `WHERE` clause, not a separate check-then-write.
- **Input validation**: every API route validates its input before touching the database.
- Can I explain this code out loud, from memory, without rereading it? If not, re-read it until I can.

## Keeping Docs in Sync
Update the relevant context file whenever implementation changes:
- System architecture or boundaries → `architecture.md`
- Storage model decisions → `architecture.md`
- Code conventions or standards → `code-standards.md`
- Feature scope → `product-spec.md`

## Before Moving to the Next Unit
1. The current unit works end to end within its defined scope.
2. No invariant defined in `architecture.md` was violated.
3. `progress-tracker.md` reflects the completed work.
4. `npm run build` passes.
5. The author can explain the unit's logic out loud without looking at the code.
