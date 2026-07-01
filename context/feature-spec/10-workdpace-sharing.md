# Workspace Sharing System

Build the `/notes/[id]` workspace with secure note-sharing features.

The workspace should support creating and managing share links.

Example workspace:

```
My Second Note

A secure workspace for your notes and shared context.

Project ID:
cmr1qk8q20000rgvxuxs7tade

Back to editor home
```

---

# Workspace Features

Inside:

```
/notes/[id]
```

Add sharing functionality.

The workspace should contain:

- Note title
- Note description/content
- Project ID
- Share button
- Share link management


---

# Share Link Generation

Users should be able to generate a secure share link from the workspace.


Example:

```
Share Note

Generate Link
```

After generation:

```
https://domain.com/share/abc123xyz
```


Requirements:

- Generate secure unique token
- Link belongs to current project
- Only project owner can manage links


---

# Share Types

Support:

## 1. One-Time Access


One-time links can be opened successfully only once.


Flow:

```
User opens link

        |
        ↓

Validate link

        |
        ↓

Show note

        |
        ↓

Mark link as used

        |
        ↓

Increase view count
```


After first successful access:

```
Link expired
```


Rules:

- Second user cannot access
- Multiple users cannot consume the same link simultaneously


---

## 2. Time-Based Access


Allow users to select expiry date and time.


Example:

```
Expires:
01-07-2026 10:00 PM
```


Before expiry:

```
Access allowed
```


After expiry:

```
Expired link
```


---

# Access Types


## Public Access


Anyone with the link can open.


Flow:

```
Open link

↓

Validate token

↓

Check expiry

↓

Increase view count

↓

Display note
```


No password required.


---

## Password Protected Access


Generate a dynamic password/access key.


Example:

```
Access Key:

A82K91
```


Flow:

```
Open link

↓

Enter password

↓

Verify password

↓

Success

↓

Increase view count

↓

Show note
```


Wrong password:

```
Access denied

View count unchanged
```


---

# Workspace Share UI


Add share button in workspace navbar.


Click:

```
Share
```

Open share dialog:


Fields:

```
Share Type:

○ One-time access

○ Time-based access


Access Type:

○ Public

○ Password Protected


Expiry Date:
[Date picker]


Generate Link
```


---

# Share Link Management


Owner should be able to:


## View Share Link

Display:

```
Share URL

Access Type

Share Type

Expiry Status

View Count
```


---

## Revoke Link


Allow owner to invalidate link.


Action:

```
Revoke
```


After revoke:

```
This link is no longer available
```


---

# View Count Tracking


Increase count only for successful access.


## Public Link

Successful opening:

```
viewCount + 1
```


## Password Protected Link

Correct password:

```
viewCount + 1
```


Wrong password:

```
No increase
```


Do not increase for:

- Invalid link
- Expired link
- Revoked link
- Wrong password
- Already used one-time link


---

# API Routes


## Generate Share Link

```
POST /api/share
```


Creates:

- token
- share configuration
- password hash if required


---

## Open Shared Note

```
GET /api/share/[token]
```


Handles:

- Public access
- Expired link
- Revoked link
- One-time link


---

## Unlock Password Link

```
POST /api/share/[token]/unlock
```


Handles:

- Password verification
- View count update


---

## Revoke Share Link

```
PATCH /api/share/[token]/revoke
```


Handles:

- Owner validation
- Link invalidation


---

# Database Requirements


ShareLink table:


```
id

token

projectId

shareType

accessType

passwordHash

expiryAt

viewCount

usedAt

revokedAt

createdAt
```


---

# Security Rules


## Authentication

No user:

```
401 Unauthorized
```


## Authorization

Non-owner:

```
403 Forbidden
```


Only owners can:

- Generate links
- Revoke links


---

# Race Condition Handling


Problem:

Two users open one-time link at the same moment.


Solution:

Use database transaction.


Process:

```
Start transaction

Check usedAt

If unused:

    mark used

    increase count


Commit
```


Use:

```
Prisma transaction
```


---

# Required Pages


Workspace:

```
/notes/[id]
```


Shared view:

```
/share/[token]
```


---

# Completion Checklist


- [ ] Workspace displays current note
- [ ] Share button added
- [ ] Generate share link works
- [ ] One-time link works
- [ ] Time-based expiry works
- [ ] Public link works
- [ ] Password protected link works
- [ ] Dynamic password generated
- [ ] Wrong password handled
- [ ] View count updated correctly
- [ ] Revoke link works
- [ ] Race condition handled
- [ ] No TypeScript errors