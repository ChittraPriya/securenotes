# Sharing

## Project Goal

Implement a secure note-sharing system with expiring share links.

Users should be able to share their notes securely using generated links.

The system should support:

- Public sharing
- Password-protected sharing
- One-time access links
- Time-based expiry links
- Link revocation
- View tracking
- Race-condition-safe access handling


---

# Functional Requirements


## 1. Share Link Generation

After note creation, generate a secure share link.

Example:

```
https://domain.com/share/{token}
```

Requirements:

- Generate a unique token
- Token must be secure and unpredictable
- Token must be connected to the note/project
- Only authorized users can generate share links


---

# Share Types


## 1. One-Time Access

A one-time share link can be opened successfully only once.


Flow:

```
User opens link

        |
        ↓

Validate token

        |
        ↓

Check if already used

        |
        ↓

Allow access

        |
        ↓

Mark link as used

        |
        ↓

Increase view count
```


Rules:

- First successful access consumes the link
- After successful access, the link becomes invalid
- Multiple users cannot consume the link simultaneously


Example:

```
First user:
Success ✅

Second user:
Link expired ❌
```


---

## 2. Time-Based Access

A time-based link works until the selected expiry time.


Example:

```
Expiry:
01-07-2026 10:00 PM
```


Before expiry:

```
Access allowed
```


After expiry:

```
Access denied
Expired link
```


Rules:

- User selects expiry date/time
- Backend validates expiry on every request
- Expired links cannot be opened


---

# Access Types


## 1. Public Access


Public links do not require authentication or password.


Flow:

```
Open share link

        |
        ↓

Validate token

        |
        ↓

Check expiry/revoke status

        |
        ↓

Increase view count

        |
        ↓

Display note
```


---

## 2. Password Protected Access


Password protected links require a password/access key.


Flow:

```
Open share link

        |
        ↓

Show password input

        |
        ↓

User enters password

        |
        ↓

Verify password

        |
        ↓

Success

        |
        ↓

Increase view count

        |
        ↓

Display note
```


Wrong password:

```
Access denied

No view count increase
```


---

# Database Design


## ShareLink Model


Required fields:


```prisma
model ShareLink {

  id String @id @default(cuid())


  token String @unique


  projectId String

  project Project @relation(
    fields:[projectId],
    references:[id]
  )


  shareType ShareType


  accessType AccessType


  passwordHash String?


  expiryAt DateTime?


  viewCount Int @default(0)


  usedAt DateTime?


  revokedAt DateTime?


  createdAt DateTime @default(now())

}
```


---

# Enums


```prisma
enum ShareType {

 ONE_TIME

 TIME_BASED

}
```


```prisma
enum AccessType {

 PUBLIC

 PASSWORD

}
```


---

# API Routes


## 1. Create Share Link


Endpoint:

```
POST /api/share
```


Purpose:

Create a secure share link.


Steps:

1. Authenticate user
2. Verify note ownership
3. Generate secure token
4. Create ShareLink record
5. Generate password if required
6. Return share URL


Example response:

```json
{
 "shareUrl":"/share/a82kd92k",
 "password":"A82KD9"
}
```


---

# 2. Get Shared Note


Endpoint:

```
GET /api/share/[token]
```


Responsibilities:


Validate:

- Token exists
- Token is not revoked
- Token is not expired
- One-time link is not already used


Possible responses:


Success:

```
200 OK
```


Invalid token:

```
404 Not Found
```


Expired:

```
410 Gone
```


Revoked:

```
403 Forbidden
```


Already used:

```
410 Gone
```


---

# 3. Unlock Password Protected Link


Endpoint:

```
POST /api/share/[token]/unlock
```


Responsibilities:


- Receive password
- Compare with stored hash
- Allow access only if valid
- Increase view count after successful unlock


Wrong password:

```
401 Unauthorized
```


Important:

Wrong password must not increase view count.


---

# 4. Revoke Share Link


Endpoint:

```
PATCH /api/share/[token]/revoke
```


Responsibilities:

- Verify logged-in user
- Verify ownership
- Mark link as revoked


Update:


```ts
revokedAt = new Date()
```


After revoke:

```
Link cannot be accessed
```


---

# Password Generation Logic


Requirements:

- Generate random password/access key
- Do not store plain password


Example generated key:

```
K8D92P
```


Store:

```
bcrypt(password)
```


Database:

```
passwordHash
```


Verification:


```ts
bcrypt.compare(
 enteredPassword,
 passwordHash
)
```


---

# Token Generation Logic


Use secure random generation.


Example:

```ts
crypto.randomBytes(32)
```


Requirements:

- Unique
- Random
- Impossible to guess
- Stored in database


---

# Expiry Logic


## Time Based


Check:


```ts
if(new Date() > expiryAt){

 return expired

}
```


---

## One Time


After successful access:


Update:


```ts
usedAt = new Date()
```


Next request:


```
Already used
```


---

# View Count Logic


Increase view count only for successful access.


## Public Link


Successful opening:

```
viewCount + 1
```


---

## Password Protected Link


Correct password:

```
viewCount + 1
```


Wrong password:

```
No increase
```


---

## Do Not Increase Count For:


- Invalid token
- Expired link
- Revoked link
- Wrong password
- Already used one-time link


---

# Race Condition Handling


## Problem


Two users open the same one-time link at the same time.


Example:


```
User A opens link
User B opens link
```


Both should not get access.


---

## Solution


Use database transaction.


Logic:


```
Start transaction

        |
        ↓

Lock share record

        |
        ↓

Check usedAt

        |
        ↓

If already used:
    reject request


Else:

    update usedAt

    increase view count


Commit transaction
```


Implementation:


```ts
await prisma.$transaction()
```


This guarantees only one successful access.


---

# Security


## Authentication


Use:

```
Clerk Authentication
```


Unauthenticated:

```
401 Unauthorized
```


---

## Authorization


Only owner can:

- Create share link
- Revoke share link


Non-owner:

```
403 Forbidden
```


---

# Brute Force Protection


For password links:


Implement:


## Rate Limiting

Example:

```
5 attempts per minute
```


## Failed Attempt Tracking

Store:

```
IP address
Token
Attempt count
```


## Temporary Lock


After multiple failures:


```
Block attempts for some time
```


---

# Required Pages


## Share Page


Create:


```
app/share/[token]/page.tsx
```


Features:


Public link:

- Display note directly


Password link:

- Show password input


Handle:


- Invalid link
- Expired link
- Revoked link
- Already used link


---

# Frontend Components


Required:


```
components/share

├── share-password-form.tsx

├── shared-note-view.tsx

└── share-status.tsx
```


---

# Testing Checklist


## Share Creation

- [ ] Generate share link
- [ ] Generate password for protected links


## Public Access

- [ ] Open public link
- [ ] View count increases


## Password Access

- [ ] Password prompt appears
- [ ] Correct password works
- [ ] Wrong password rejected
- [ ] Wrong password does not increase count


## Expiry

- [ ] Time expiry works
- [ ] One-time expiry works


## Revoke

- [ ] Owner can revoke
- [ ] Revoked link blocked


## Security

- [ ] Invalid token handled
- [ ] Unauthorized user blocked
- [ ] Race condition handled


---

# README Documentation


README must include:


## Setup Instructions


## Tech Stack


## Database Schema


## Share Link Flow


## Password Generation Logic


## Expiry Logic


## Revoke Logic


## View Count Logic


## Race Condition Handling


---

# AI Implementation Instruction


Read this document and implement the Share Link System.


Rules:

- Follow existing project structure
- Use existing Prisma setup
- Use Clerk authentication
- Create backend APIs first
- Do not modify unrelated UI
- Keep TypeScript strict
- Run build after implementation