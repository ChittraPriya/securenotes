# Clerk Authentication Implementation

Clerk is already installed and configured.

Use Clerk for all authentication.

Do not create any custom authentication API routes or authentication logic.

---

## Authentication

Use Clerk components for:

- Sign In
- Sign Up
- User Button
- Authentication state
- Route protection

Use:

- `<SignIn />`
- `<SignUp />`
- `<UserButton />`
- `auth()`
- `currentUser()`
- Clerk middleware

Do not replace Clerk authentication with custom forms.

---

## UI Requirements

Customize the appearance of the Clerk Sign In and Sign Up pages to match the application's design.

The pages should visually resemble the provided design while still using Clerk's authentication components.

---

## Register Page

Desktop layout:

Two-panel layout.

### Left Panel

Include:

- `/Register.png`
- Title:
  Create Your Account
- Subtitle:
  Start sharing your notes the smart way

Display three feature cards:

- ShieldCheck
- Link2
- Eye

Use the application's design system.

---

### Right Panel

Instead of custom inputs, render Clerk's Sign Up component.

Customize Clerk using the `appearance` prop.

Center the Clerk card vertically and horizontally.

Maximum width:

420px

Keep Clerk validation, OAuth providers, loading states, and authentication flow.

Do not recreate registration logic.

---

## Login Page

Use the same two-panel layout.

Left panel contains:

- Illustration
- Welcome Back heading
- Feature cards

Right panel contains Clerk's Sign In component.

Customize it with the application's design system.

---

## Appearance

Use Clerk's Light theme as the base.

Customize colors using the application's CSS variables.

Do not hardcode colors.

Use:

- --bg-base
- --bg-surface
- --text-primary
- --text-secondary
- --border-default
- --accent-primary

Use Clerk's `appearance` API instead of modifying Clerk's internal components.

---

## Mobile

Hide the left panel.

Display only the Clerk authentication card.

---

## Do Not Change

Do not modify:

- Clerk configuration
- Middleware
- Authentication flow
- Session management
- Route protection
- Redirect logic

Only customize the UI and layout around the Clerk components.
