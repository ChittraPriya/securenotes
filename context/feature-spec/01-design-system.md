Read `AGENTS.md` before starting.

We're adding the design system and UI primitive components.

Install and configure `shadcn/ui`.

Add these shadcn components:
- Button
- Card
- Dialog
- Input
- Label
- Textarea
- Badge
- Alert
- ScrollArea

Do not modify the generated `components/ui/*` files after installation — these are protected per AGENTS.md.

Also install `lucide-react`.

Create `lib/utils.ts` with the reusable `cn()` helper for merging Tailwind classes.

Wire the shadcn theme config to the CSS custom properties already defined in `globals.css` (see `ui-context.md` for the token list) — do not introduce new hardcoded colors.

### Check when done
- All components import without errors
- `cn()` works properly
- No default light styling appears anywhere (test by toggling no dark-mode class — there should be no light variant to fall back to, since this app is dark-only)
- Every installed component renders using `--bg-surface` / `--border-default` / `--text-primary` etc., not shadcn's default zinc/slate palette