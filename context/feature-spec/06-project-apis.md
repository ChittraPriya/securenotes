The database schema is ready,. Build the backend project API routes only.

## Routes

Create REST endpoints for:

- `GET/api/notes` , list current user's project
- `POST/api/notes` , create notes
- `PATCH/api/notes/[notesId]`, rename notes
- `DELETE/api/notes/[notesId]`, delete notes

## Rules

Use the authenticated Clerk user ID as `ownerId`.

When creating:

- default missing notes name to  `Untitled Project`
- use the schema's existing ID strategy, do not add sequential IDs

Security:

- unauthenticated requests return `401`
- only the project owner can rename or delete
- non-owner mutations return `403`

keep this backend-only. Do not wire the UI yet.


## Check when Done

- routes exist for list/create/rename/delete
- owner checks are enforced for rename/delete
- `401` and `403` responses are handled correctly
- `npm run build` passes