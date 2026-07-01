Build the `editor/[id]` workspace shell eith server-side access checks. No canvas logic yet.

## Access

`/editoe/[id]` must be a server component.

Before rendering:
- unauthenticated users redirect to `/login`
- users without notes access see `AccessDenied`
- non-existent projects also show `AccessDenied`

Create `components/editor/access-denied.tsx` with:

- centered layout
- lock icon
- short message
- link back to `/editor`

## Access Helpers

Create `lib/project-access.ts` with helpers for:

- getting current Clerk identity: `userId` + primary email
- checking project access by owner or collaborator

## Layout

Build a full-viewport workspace layout with:

- top navbar showing the project name
- navbar actions: share button and AI sidebar toggle
- existing `ProjectSidebar` on the left
- current room highlighed in the sidebar
- central canvas placeholder with background and centered message
- right sidebar placeholder for future AI chat

The canvas area should fill the remaining space.

## Check When Done

- `/editor/[id]` builds successfully
- access helper exists outside the page component
- `AccessDenied` is used for missing or unauthorised project
- workspace layout renders with current project context
- no TypeScript errors


