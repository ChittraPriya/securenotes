Wire the editor home sidebar and dialogs to the real project API.

## Data Fetching

The editor home page is a server component.

Fetch owned and shared projects server-side using the existing project data helper and pass both lists to the sidebar.

No client-side fetching for initial load.

### `Use Project Actions`

Create a hook in `hooks/` that manages dialog state and project mutations.

**Create**

- manage create dialog state
- manage project name input
- generate a short unique suffix
- slugify the name to create the room ID
- call `POST/api/notes`
- navigate to the new workspace

The project ID and Liveblocks room ID should stay aligned

**Rename**

- store target project id + current name
- call `PATCH/api/notes/[id]`
- refresh on success

**Delete**

- store target project
- call `DELETE/api/notes/[id]`
- redirect to `/editor` if deleting the active workspace
- otherwise refresh

### Wiring

Connect the hook to the sidebar and dialogs.

- create dialog shows room ID preview
- rename dialog pre-fills current name
- delete dialog shows project name

### Check When Done

- sidebar uses real note data
- create navigates to workspace
- rename updates correctly
- delete refreshes or redirects correctly
- `npm run build` passes