Prisma is already installed. Add the project data models, Prisma client singleton, and first migration

## Models

Create `prisma/models/notes.prisma`.

Add `Project`:

- owner ID mapped to Clerk user
- name
- optional description
- status enum: `DRAFT`, `ARCHIVED`
- `canvasIsonPath` for future canvas blob stroage
- timestamps
- indexes on owner ID and creation date

Add `ProjectCollaborator`:

- project relation with cascade delete
- collaborator email
- creation timestamp
- unique constraint on project/email
- indexes on email and project/date

Don not add extra fields unless required by Prisma.

## Prisma Client

Create `lib/prisma.ts` as a cached singleton.

Branch by `DATABASE_URL`:

- if it starts with `prisma+postgres://`, use Accelerate
- otherwise use direct `@prisma/adapter-pg`

Cache the client on `global` in development for hot reloads.

## Migration

Run the migration and generate the client.

## Dependencies

Already installed:

- `prisma`
- `@prisma/client`
- `@prisma/adapter-pg`
- `pg`

## Check When Done

- schema has both modules with correct relations and indexes
- `lib/prisma.ts` exports one cached Prisma instance
- migration runs successfully
- `npm run build` passes