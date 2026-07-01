# UI Context

# Theme

Secure Notes uses a **Light Theme only**.

The application must always use the light theme.

There is **no Dark Mode** and **no theme toggle**.

The interface should provide a clean, professional, and security-focused workspace with high readability and consistent visual hierarchy.

---

# Theme Rules

- All colors must be referenced through CSS custom properties.
- Components must never contain hardcoded hexadecimal colors.
- Tailwind utilities should reference CSS variables whenever possible.
- Interactive elements (buttons, links, focus rings) use the primary accent color consistently.
- The application background is always light.
- The design should remain consistent across all pages.

---

# Color Tokens

| Role | CSS Variable | Hex Value |
|------|--------------|-----------|
| Page Background | `--bg-base` | `#f8fafc` |
| Surface | `--bg-surface` | `#ffffff` |
| Surface (Raised) | `--bg-surface-raised` | `#f1f5f9` |
| Elevated Surface | `--bg-elevated` | `#e2e8f0` |
| Subtle Surface | `--bg-subtle` | `#f8fafc` |
| Primary Text | `--text-primary` | `#0f172a` |
| Secondary Text | `--text-secondary` | `#334155` |
| Muted Text | `--text-muted` | `#64748b` |
| Faint Text | `--text-faint` | `#94a3b8` |
| Primary Accent | `--accent-primary` | `#4f46e5` |
| Primary Accent Hover | `--accent-primary-dim` | `#4338ca` |
| AI Accent | `--accent-ai` | `#7c3aed` |
| AI Text | `--accent-ai-text` | `#6d28d9` |
| Border | `--border-default` | `#cbd5e1` |
| Error | `--state-error` | `#dc2626` |
| Success | `--state-success` | `#16a34a` |
| Warning | `--state-warning` | `#ca8a04` |

---

# Color Rules


- Use semantic CSS variables for every component.
- Use `bg-bg-base` for page backgrounds.
- Use `bg-bg-surface` for cards.
- Use `text-text-primary` for primary text.
- Use `border-border-default` for borders.
- Never use `bg-black`, `text-white`, `dark:bg-*`, `dark:text-*`, or `.dark`.
- Every generated UI must follow the Light Theme design system.