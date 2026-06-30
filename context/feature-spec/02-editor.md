
We're adding the base chrome components for the notes workspace — the top navbar and the left sidebar shell. These will be reused across `/notes/new` and `/notes/[id]`.

### Editor Navbar

Create `components/editor/editor-navbar.tsx`.

Requirements:
- Fixed-height top navbar.
- Left, center, and right sections.
- Left section contains a sidebar toggle button.
- Use `PanelLeftOpen` / `PanelLeftClose` icons based on sidebar state.
- Right section stays empty for now (reserved for user/logout menu, added in a later chapter).
- Dark background with subtle bottom border, using `--bg-surface` and `--border-default` from `globals.css`.

### Notes Sidebar

Create `components/editor/notes-sidebar.tsx`.

Requirements:
- Sidebar floats above the page content (not a push layout).
- Opening it does not reflow or push the canvas.
- Slides in from the left.
- Accepts an `isOpen` prop.
- Header with "My Notes" title + close button.
- Lists the signed-in user's own notes (empty placeholder state when there are none).
- Full-width "New Note" button at the bottom with a `Plus` icon, linking to `/notes/new`.

No `Tabs` component — there is no "Shared" view; multi-user collaboration is explicitly out of scope per `product-spec.md`. If shared/collaborative notes become an actual requirement later, that's a scope change to raise in `product-spec.md` first, not a UI addition here.

### Dialog Pattern

Use the existing color tokens from `globals.css` for dialog styling.

Support:
- Title
- Description
- Footer actions

Do not build actual dialogs yet — this is scaffolding for the "revoke share link" confirmation dialog defined in `product-spec.md`, to be wired up in a later chapter.

### Check when done
- New components compile without TypeScript errors.
- No lint errors.
- Sidebar does not affect page layout/reflow when toggled.
- Dialog pattern is ready for future use.