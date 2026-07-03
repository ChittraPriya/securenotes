# SecureNotes — Secure Expiring Note Sharing

A note-sharing app where every share link is a sealed, single-purpose key: it opens once (one-time), or until a deadline (time-based), and can be locked behind a password or left public — with the owner able to revoke it at any time.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | Next.js Route Handlers (`app/api/**/route.ts`) |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | Clerk (authentication) with httpOnly session cookies |
| Icons | lucide-react |

> Route Handlers were used instead of a separate Hono.js server — they satisfy "Next.js API routes / Route Handlers or Hono.js" directly, and keep the whole app in one deployable Next.js project (simpler for a 1–2 day build, same request/response model).

## Setup instructions

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# edit .env: set DATABASE_URL to your Postgres instance,
# add your Clerk API keys from https://dashboard.clerk.com,
# and set SEED_USER_ID to your Clerk user ID if you want demo data

# 3. Create the database schema
npx prisma migrate dev --name init

# 4. Seed demo data (optional, for grading/demo)
#    First set SEED_USER_ID in .env to your Clerk user ID (find it in Clerk Dashboard → Users)
npx prisma db seed

# 5. Run the app
npm run dev
# open http://localhost:3000
```

**Demo data** (created by the seed script):
- 3 projects owned by the user identified by `SEED_USER_ID`
- 3 share links on the "Getting Started Guide" project (one-time public, time-based public, password-protected)
- 1 collaborator (`collaborator@example.com`) on "Architecture Notes"

## Database schema

```
Project
 ├─ id, ownerId (Clerk user ID), name, description, content
 ├─ status: DRAFT | ARCHIVED
 ├─ createdAt, updatedAt
 ├─ collaborators: ProjectCollaborator[]
 └─ shareLinks: ShareLink[]

ProjectCollaborator
 ├─ id, projectId → Project, collaboratorEmail
 └─ @@unique([projectId, collaboratorEmail])

ShareLink
 ├─ id, token (unique, random)
 ├─ projectId → Project
 ├─ shareType:  ONE_TIME | TIME_BASED
 ├─ accessType: PUBLIC | PASSWORD
 ├─ passwordHash (bcrypt, null if PUBLIC)
 ├─ expiryAt (null unless TIME_BASED)
 ├─ viewCount (incremented only on a successful view)
 ├─ usedAt (set on consume for ONE_TIME links)
 ├─ revokedAt (owner can set this any time)
 ├─ failedAttempts, lockedUntil (brute-force protection)
 └─ createdAt
```

Full Prisma schema: `prisma/schema.prisma`.

## Share link flow

1. **Create**: `POST /api/share` creates a `ShareLink` for a project, generates a random `token` (256-bit, hex, used in the URL), and — if password-protected — a human-typeable access key.
2. **Visit**: `GET /share/[token]` page calls `GET /api/share/[token]`, which **only checks status** (invalid / revoked / expired / used / locked out / needs password / public) — it never increments the view count or marks anything used. This separation matters: checking status must be side-effect-free, or refreshing the page could burn a one-time link.
3. **Consume**: Actually viewing the note — `POST /api/share/[token]/unlock` — is the only action that can increment `viewCount` or set `usedAt`. Public links call this automatically on page load; password links call it after the visitor submits the key.
4. **Owner manages**: `/notes/[id]` lists the note's share link(s) with live status and a **Revoke** button.

## Password / key generation logic

- `lib/tokens.ts` → `generateShareToken()`: 16 random bytes (`crypto.randomBytes`), base64url-encoded → the link token. ~128 bits of entropy, not guessable.
- `generateAccessKey()`: an 8-character key in `XXXX-XXXX` format, drawn from an unambiguous 31-character alphabet (no `0/O`, `1/I/L`) so it's easy to read aloud or retype.
- The **raw key is returned to the owner exactly once**, in the create-note API response. The database only ever stores `bcrypt.hash(key)` — even a database leak doesn't expose usable keys.

## Expiry logic

- **Time-based**: `expiresAt` is set at creation. Every status check and every consume attempt compares `expiresAt` against `now()` in the same query/transaction — there's no separate "expiry sweep" job needed, so a link is correctly treated as expired the instant the clock passes it, even if no cron has run.
- **One-time**: there's no `expiresAt`; instead `isUsed` is flipped atomically the moment a view succeeds (see Race-condition handling below). Functionally, it "expires" on its first successful view.

## Invalidate / revoke logic

`POST /api/notes/[id]/revoke` (owner-only, checked via session + note ownership) sets `isRevoked = true`. Every status check and the consume endpoint check `isRevoked` first, before anything else — so revocation takes effect immediately on the very next request, with no caching or delay.

## View count logic

`viewCount` increments **only** inside the same atomic SQL statement that validates and claims the link (see below) — never as a separate step. This guarantees:

- Public view → count +1
- Successful password unlock → count +1
- Wrong password → **no** increment (the failed-password branch never reaches the claim statement)
- Expired / revoked / already-used → **no** increment (the claim statement's `WHERE` clause excludes these rows, so it returns zero rows and nothing is touched)

## Race-condition handling

This is the core design problem in the spec, so it gets its own section.

The naive approach — `SELECT` the link, check `isUsed` in application code, then `UPDATE` it — has a race window: two requests can both read `isUsed = false` before either writes. Both would then think they're the legitimate first viewer.

The fix in `app/api/share/[token]/route.ts` is to make the check-and-claim a **single atomic SQL statement**, not two steps:

```sql
UPDATE "ShareLink"
SET "isUsed" = true,
    "viewCount" = "viewCount" + 1
WHERE token = $1
  AND "isUsed" = false
  AND "isRevoked" = false
  AND ("expiresAt" IS NULL OR "expiresAt" > now())
RETURNING *;
```

PostgreSQL takes a row-level lock for the duration of an `UPDATE`. If two requests hit this statement concurrently, the database itself serializes them: one acquires the lock, flips `isUsed` to `true`, and commits; the second then evaluates `WHERE isUsed = false` against the already-updated row, matches nothing, and gets back zero rows. The application code just checks `claimed.length === 0` and reports "already used" — there is no app-level mutex, queue, or distributed lock required, because the database guarantees the serialization for free.

The same pattern (atomic `WHERE` + `RETURNING`) is used for time-based links' view-count increments, so concurrent viewers of a still-valid time-based link all get correctly counted without lost updates.

## Answers to the required questions

**How do you prevent two users from using a one-time link at the same time?**
A single atomic `UPDATE ... WHERE "isUsed" = false ... RETURNING *` statement. Whoever's update commits first wins the row; the second request's same statement matches zero rows because the condition is no longer true, so it cleanly reports "already used" with no race window between checking and claiming.

**How do you update view count safely?**
The increment (`"viewCount" = "viewCount" + 1`) lives inside that same atomic, conditional `UPDATE` — never read-modify-write in application code. Each successful request contributes exactly one increment, and failed/invalid/expired/revoked attempts never reach that statement at all.

**How would this work if 1 million people opened the link?**
- *One-time link*: still only one winner. The atomic `UPDATE` scales fine — Postgres resolves the row lock in microseconds, so the other 999,999 requests just get a fast "already used" response; there's no thundering-herd problem because losing the race is cheap.
- *Time-based link*: 1M concurrent increments on a single row creates write contention (every request needs the same row's lock briefly). At that scale the production fix would be to offload the counter to something like Redis `INCR` (lock-free, in-memory) and periodically/asynchronously flush the aggregate into Postgres, rather than hammering one Postgres row directly. For this assessment's scope, the direct atomic `UPDATE` is correct and simple; the Redis layer is the noted scaling path beyond it.

**How would you prevent brute-force attempts on password-protected links?**
Layered: (1) keys are bcrypt-hashed, so each guess costs real compute time; (2) a per-link `failedAttempts` counter triggers a `lockedUntil` timeout (5 minutes) after 5 wrong guesses; (3) the access key itself has ~31^8 possible values, far beyond what's guessable inside a 5-minute lockout window; (4) in production, an IP-based rate limit at the edge/middleware layer would be added as a second line of defense independent of which link is being attacked.

## Edge cases handled

| Case | Where |
|---|---|
| Invalid share link | `GET/POST /api/share/[token]` → `404`/`status: "invalid"` when no row matches the token |
| Public share link access | `accessType = PUBLIC` skips the password branch, claims the view directly |
| Password-protected access | `accessType = PASSWORD` requires a correct key before the claim statement runs |
| Wrong password/key | bcrypt compare fails → attempt counter increments, **no** view-count change, link stays claimable |
| Expired share link | `expiresAt` checked in both the status read and the atomic claim's `WHERE` clause |
| One-time link already used | `isUsed` checked in both the status read and the atomic claim's `WHERE` clause |
| Revoked share link | `isRevoked` checked first, before any other condition, in every code path |
| Concurrent one-time access | atomic `UPDATE ... WHERE isUsed = false ... RETURNING *` — see Race-condition handling |
| Accurate view count | increment lives inside the same atomic statement as the validity check, never a separate step |

## Pages

- `/login`, `/register` — email/password auth, JWT session cookie
- `/notes/new` — create a note, choose share/access type, get the link (+ key, shown once)
- `/notes/[id]` — owner view: note content, link status, revoke button
- `/share/[token]` — public-facing link: handles every state above with a dedicated message and no false positives on view count
