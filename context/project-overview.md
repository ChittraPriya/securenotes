# Secure Notes — Project Overview

## Overview
Secure Notes is a secure note-sharing application. A signed-in user writes a note and generates a share link with configurable access rules — how many times it can be viewed (one-time vs time-based) and who can view it (public vs password-protected). The product solves the problem of sharing sensitive, ephemeral text (credentials, internal info, one-off messages) without leaving a permanent, freely-readable artifact behind. This build is a rebuild of an earlier POC submission for Peacock India, done deliberately slowly so every technical decision can be explained, not just shipped.

## Goals
1. Every share link enforces exactly the access rule it was created with — no link can be viewed more times, by more people, or for longer than configured.
2. View counting is accurate under concurrent access — two simultaneous requests to a one-time link must not both succeed.
3. The author can fully understand and verbally explain every security-relevant decision in the codebase: the share link flow, the password/key generation, and the race-condition handling.

## Core User Flow
1. User registers / logs in.
2. User creates a note (title, content, expiry date/time).
3. User chooses share type (one-time or time-based) and access type (public or password-protected).
4. App generates a share link (and a dynamic password/key if password-protected).
5. User shares the link externally. A recipient opens `/share/[token]`.
6. App checks link validity (not expired, not revoked, not already used if one-time) before showing content.
7. If password-protected, recipient enters the password; on success, content is shown and the link is consumed/counted. On failure, nothing is consumed.
8. Note owner can view share link status (active/used/expired/revoked) and force-revoke any link from `/notes/[id]`.

## Features

### Note Management
- Create a note with title, content, and expiry date/time.
- View own notes and their associated share links.

### Share Link Generation
- One-time access: link is valid for exactly one successful view/unlock, then permanently expires.
- Time-based access: link is valid until a fixed expiry timestamp, viewable multiple times until then.
- Public access: no password required, content shown immediately on link open.
- Password-protected access: a dynamic password/key is generated at link-creation time; content is gated behind it.

### Access Validation & Edge Cases
- Invalid token → generic "link not found" state (no leakage of whether a note exists).
- Expired link → "this link has expired" state.
- Revoked link → "this link has been revoked" state, indistinguishable from expired to the recipient.
- Wrong password → error shown, no count increment, no link consumption.
- One-time link already used → "already viewed" state.
- Concurrent opens of a one-time link → exactly one succeeds; all others see "already viewed."

### View Count Tracking
- Public view → count increases on every successful open (time-based) or on the single successful open (one-time).
- Successful password unlock → count increases.
- Wrong password → no count increase.
- Expired/revoked/already-used → no count increase.

## Scope

### In Scope
- Everything listed under Features above.
- `/login`, `/register`, `/notes/new`, `/notes/[id]`, `/share/[token]` pages exactly as specified.
- PostgreSQL + Prisma, Next.js App Router + TypeScript, Hono.js for API routes, shadcn/ui.

### Out of Scope
- Note editing/versioning after creation.
- Multi-user collaboration on a single note.
- Email notifications on view/expiry.
- Any dashboard/analytics beyond per-link view count.
- Rich text / file attachments — plain text content only.

## Success Criteria
1. A signed-in user can create a note and generate both a one-time and a time-based share link, of both public and password-protected access types.
2. Opening a one-time link twice in rapid succession (simulated concurrently) results in exactly one successful view and one count increment.
3. The owner can revoke a link and the recipient immediately sees it as invalid.
4. The author can explain, without notes, the two-step share link flow (status check → atomic consume), the database relationships, the password/key generation logic, and the atomic update pattern preventing race conditions.
