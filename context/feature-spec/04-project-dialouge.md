## Goal

Build the `/editor` home screen and add project dialogs/sidebar actions. No API calls or persistence yet.

## Editor Home

Reuse the existing editor layout. Do not modify the navbar or side =bar behaviour.

In the center of the page , add:

- heading: `Create a note or open an existing one`
- description: `Start a new architecture workspace, or choose a project from the sidebar.`
- `New Note` button with a `Plus` icon

keep the layout minimal. Do not wrap this content in cards.

Clicking `New Note` should open the Create Project dialog

## Dialogs

### Create Project

- Note name input
- live slog preview based on the name
- preview updates as the user types

### Rename Note

- prefilled project name input
- current note name shown in the dascription
- input auto-focuses
- Enter submits

### Delete Note

- destructive confirmation only
- no Input
- confirm button uses destructive  styling

## Sidebar

Add Note item actions:

- rename
- delete

Show actions only for owned projects

Hide actions for shared/collaborator projects.

on mobile:

- tapping outside the sidebar closes it
- add a backdrop scrim

## Implementation

Create a dedicated hook to manage

- dialog state
- form state
- loading state

Wire:

- editor home `New Project` - Create dialog
- sidebar create -> Create dialog
- sidebar rename -> Rename dialog
- sidebar delete -> Delete dialog

Use mock project data only. Do not add API calls or persistence.

## Check When Done 

- sidebar actions are wired
- slug preview works
- no TypeScript errors
- no link errors