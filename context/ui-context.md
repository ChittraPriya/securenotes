# UI Context

## Theme

Secure Notes supports both **Light** and **Dark** themes.

**Default:** Light mode

Users may switch between Light and Dark themes using the application theme toggle. The selected theme should persist across sessions.

The design language emphasizes a secure, professional workspace rather than a consumer note-taking application. Interfaces should feel clean, structured, and trustworthy with consistent spacing, restrained use of color, and clear visual hierarchy.

**Theme Rules**

- All colors must be referenced through CSS custom properties.
- Components must never contain hardcoded hex values.
- Both themes expose the same semantic color tokens.
- Theme switching should only update CSS variables—not component styles.
- Interactive elements (buttons, links, focus rings) use the primary accent color consistently in both themes.

---

# Color Tokens

## Light Theme (Default)

| Role | CSS Variable | Hex Value |
|------|--------------|-----------|
| Page background | `--bg-base` | `#f8fafc` |
| Surface | `--bg-surface` | `#ffffff` |
| Surface (raised) | `--bg-surface-raised` | `#f1f5f9` |
| Elevated surface | `--bg-elevated` | `#e2e8f0` |
| Subtle surface | `--bg-subtle` | `#f8fafc` |
| Primary text | `--text-primary` | `#0f172a` |
| Secondary text | `--text-secondary` | `#334155` |
| Muted text | `--text-muted` | `#64748b` |
| Faint text | `--text-faint` | `#94a3b8` |
| Brand accent | `--accent-primary` | `#4f46e5` |
| Brand dim | `--accent-primary-dim` | `#4338ca` |
| AI accent | `--accent-ai` | `#7c3aed` |
| AI text | `--accent-ai-text` | `#6d28d9` |
| Border | `--border-default` | `#cbd5e1` |
| Error | `--state-error` | `#dc2626` |
| Success | `--state-success` | `#16a34a` |
| Warning | `--state-warning` | `#ca8a04` |

---

## Dark Theme

| Role | CSS Variable | Hex Value |
|------|--------------|-----------|
| Page background | `--bg-base` | `#0a0a0c` |
| Surface | `--bg-surface` | `#131316` |
| Surface (raised) | `--bg-surface-raised` | `#1c1c20` |
| Elevated surface | `--bg-elevated` | `#212126` |
| Subtle surface | `--bg-subtle` | `#18181c` |
| Primary text | `--text-primary` | `#f4f4f5` |
| Secondary text | `--text-secondary` | `#c0c0cc` |
| Muted text | `--text-muted` | `#9a9aa2` |
| Faint text | `--text-faint` | `#505060` |
| Brand accent | `--accent-primary` | `#6366f1` |
| Brand dim | `--accent-primary-dim` | `#3f3fa8` |
| AI accent | `--accent-ai` | `#8b5cf6` |
| AI text | `--accent-ai-text` | `#a78bfa` |
| Border | `--border-default` | `#2a2a30` |
| Error | `--state-error` | `#ef4444` |
| Success | `--state-success` | `#22c55e` |
| Warning | `--state-warning` | `#eab308` |

---

## Color Rules

- Every component must use semantic CSS variables.
- Never use hardcoded hexadecimal colors in components.
- Tailwind utilities should reference CSS variables where possible.
- Theme switching must occur by changing the root theme class or data attribute only.

---

## Typography

| Role | Font | Variable |
|------|------|----------|
| UI text | Geist Sans | `--font-sans` |
| Code / Mono | Geist Mono | `--font-mono` |

Use the mono font for:

- Generated share links
- Password/access keys
- Share tokens
- IDs
- API keys
- Any value users are expected to copy

---

## Border Radius

| Context | Class |
|----------|-------|
| Small controls | `rounded-md` |
| Cards & panels | `rounded-lg` |
| Dialogs & modals | `rounded-xl` |

---

## Component Library

The project uses **shadcn/ui** on top of **Tailwind CSS**.

Components live in:

```
components/ui/
```

Use the shadcn CLI whenever a supported component exists.

Do not recreate existing components such as:

- Button
- Input
- Dialog
- Card
- Badge
- Alert
- Dropdown Menu
- Select
- Tooltip
- Toast

---

## Layout Patterns

### Authentication (`/login`, `/register`)

- Vertically centered layout
- Single-column card
- Maximum width: 400px
- Logo/app title above the form

### Create Note (`/notes/new`)

- Single-column form
- Maximum width: 640px
- Consistent vertical spacing
- Primary action fixed at the bottom of the form on mobile

### Note Details (`/notes/[id]`)

Top section

- Note information
- Edit actions

Bottom section

- Share link management
- Existing links
- View counts
- Copy actions
- Revoke actions
- Generate new link button

### Shared Note (`/share/[token]`)

Display only one state at a time:

- Loading
- Password prompt
- Note content
- Expired
- Revoked
- Already used
- Invalid link

Never render multiple states simultaneously.

### Modals

Centered with backdrop blur.

Reserved only for:

- Revoke confirmation
- Share link successfully generated

### Navigation

Top navigation bar

Left

- Secure Notes logo
- Application name

Right

- Theme toggle
- User menu
- Logout

---

## Icons

Use **Lucide React** exclusively.

Recommended sizes

- `h-4 w-4` — inline
- `h-5 w-5` — buttons
- `h-6 w-6` — cards

Preferred icons

- Lock
- Unlock
- Clock
- Eye
- Copy
- ShieldCheck
- Link
- Trash2
- CheckCircle
- AlertTriangle
- KeyRound
- FileText

Icons should reinforce functionality without becoming decorative.