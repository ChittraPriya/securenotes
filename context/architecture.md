# Architecture Context

## Stack

| Layer      | Technology                  | Role                                                        |
| ---------- | ---------------------------- | ------------------------------------------------------------ |
| Framework  | Next.js (App Router) + TS    | Pages, server components, client UI                          |
| API        | Hono.js                      | Route handlers for auth, notes, share-link CRUD and consume  |
| UI         | Tailwind + shadcn/ui          | Component layer, styled via ui-context.md tokens             |
| Auth       | JWT (httpOnly cookie)         | Session identity for note ownership and protected routes     |
| Database   | PostgreSQL + Prisma           | Persistent storage, source of truth for all access rules     |

## System Boundaries
- `app/` — Next.js routes/pages only. No business logic here beyond rendering and calling the API layer.
- `api/` (Hono routes) — All request validation, auth checks, and orchestration of note/share-link logic. This is the only layer allowed to talk to Prisma.
- `lib/auth/` — JWT signing/verification, password hashing, session helpers. Owns all crypto-adjacent code.
- `lib/share-link/` — Share link generation, status-check logic, and the atomic consume operation. Owns the race-condition handling.
- `prisma/` — Schema and migrations only.

## Storage Model
- **Database (PostgreSQL via Prisma)**: users, notes, share links, and view-count counters. Everything that determines access control or audit state lives here — nothing relevant to security decisions lives only in memory or in the client.
- No blob/file storage in this project — note content is plain text and small enough to live directly in the `notes` table.

## Data Model
- `User` 1—N `Note`: each note has exactly one owner; a user can own many notes.
- `Note` 1—N `ShareLink`: a note can have multiple share links generated over time (e.g. user revokes one and creates another); each share link belongs to exactly one note.
- `ShareLink` fields include: token (unique, indexed), shareType (`ONE_TIME` | `TIME_BASED`), accessType (`PUBLIC` | `PASSWORD`), passwordHash (nullable, only for `PASSWORD` access), expiresAt (nullable, only for `TIME_BASED`), status (`ACTIVE` | `USED` | `REVOKED`), viewCount (integer, default 0).

## Auth and Access Model
- Every user authenticates via email/password; a signed JWT is issued and stored in an httpOnly cookie.
- `JWT_SECRET` is read from environment only. There is no fallback value — if `process.env.JWT_SECRET` is undefined, the app throws at startup rather than signing tokens with a guessable default. This was a specific vulnerability in the prior submission (`process.env.JWT_SECRET || "dev-secret-change-me"`) and is treated as a hard invariant going forward.
- Note ownership: only the authenticated owner of a note can create share links for it, view its share-link list, or revoke a link.
- Share link consumption (`/share/[token]`) is intentionally unauthenticated — recipients are not required to have an account, since the link itself is the credential.

## Invariants
1. Share link consumption is a single atomic database operation — the "is this link still valid" check and the "mark it consumed / increment view count" write happen in one `updateMany` call with the validity conditions in the `WHERE` clause, not as two separate read-then-write steps. This is what prevents two concurrent requests from both succeeding on a one-time link.
2. `JWT_SECRET` must never have a hardcoded fallback. Missing env var = hard failure at boot, not a silent insecure default.
3. View count only increments as a side effect of a successful, atomic consume — never as a separate "increment counter" call that could run independently of the validity check.
4. The `/share/[token]` page never reveals *why* a link is invalid in a way that distinguishes "doesn't exist" from "revoked" from a security standpoint — but does distinguish "expired" from "already used" from "wrong password" for usability, since none of those leak exploitable information.
