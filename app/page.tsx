import Link from "next/link";
import {
  AlertTriangle,
  Ban,
  BarChart3,
  Clock,
  Eye,
  Key,
  Lock,
  ShieldCheck,
  Unlock,
  X,
} from "lucide-react";
import { LandingAuthNav } from "@/components/auth/landing-auth-nav";

const edgeCases = [
  {
    icon: AlertTriangle,
    label: "Invalid link",
    note: "Bad or unknown token returns a clear 404 state.",
  },
  {
    icon: Unlock,
    label: "Public access",
    note: "Opens instantly, no key needed, view counted.",
  },
  {
    icon: Lock,
    label: "Password-protected",
    note: "Locked behind a bcrypt-hashed access key.",
  },
  {
    icon: X,
    label: "Wrong password",
    note: "Rejected with no view-count change.",
  },
  {
    icon: Clock,
    label: "Expired link",
    note: "Time-based links close themselves automatically.",
  },
  {
    icon: Eye,
    label: "One-time, already used",
    note: "Second visitor sees an already viewed state.",
  },
  {
    icon: Ban,
    label: "Revoked link",
    note: "Owner can kill a link instantly, any time.",
  },
  {
    icon: ShieldCheck,
    label: "Concurrent one-time opens",
    note: "Atomic database update: only one request succeeds.",
  },
  {
    icon: BarChart3,
    label: "Accurate view count",
    note: "Increments only on a genuinely successful view.",
  },
];

const steps = [
  {
    n: "01",
    title: "Write the note",
    body: "Add a title and content, from credentials to a quick message.",
  },
  {
    n: "02",
    title: "Choose how it unlocks",
    body: "One-time or time-based expiry. Public or password-protected access.",
  },
  {
    n: "03",
    title: "Share the sealed link",
    body: "Get a unique link, plus a one-time access key if it is password-protected.",
  },
  {
    n: "04",
    title: "Track or revoke",
    body: "Watch the view count update, or force-invalidate the link any time.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg-base text-text-primary">
      <header className="border-b border-border-default bg-bg-surface">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-5 w-5 text-accent-primary" aria-hidden="true" />
            <span>Secure Notes</span>
          </Link>
          <LandingAuthNav />
        </nav>
      </header>

      <section
        id="home"
        className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-20 md:grid-cols-2"
      >
        <div>
          <div className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-accent-primary">
            Secure, expiring note sharing
          </div>
          <h1 className="mb-5 max-w-xl text-4xl font-semibold leading-tight md:text-5xl">
            Every note you share is a key, not a door left open.
          </h1>
          <p className="mb-8 max-w-md text-[15px] leading-relaxed text-text-secondary">
            Create a note, seal it behind a one-time view or a deadline, and
            decide whether it needs a password. Once it is opened, revoked, or
            expired, it is closed for good.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-md bg-accent-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-accent-primary-dim"
            >
              <Key className="h-4 w-4" aria-hidden="true" />
              Get started
            </Link>
            <Link
              href="#how-it-works"
              className="rounded-md border border-border-default px-5 py-3 text-sm font-semibold text-text-secondary transition hover:bg-bg-surface-raised hover:text-text-primary"
            >
              See how it works
            </Link>
          </div>
        </div>

        <div className="max-w-sm rounded-lg border border-border-default bg-bg-surface p-6 shadow-lg md:ml-auto">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Share link
            </span>
            <span className="rounded-md bg-bg-surface-raised px-2 py-1 text-[10px] font-semibold text-accent-primary">
              Active
            </span>
          </div>
          <div className="rounded-lg border border-border-default bg-bg-subtle p-4">
            <code className="mb-3 block truncate rounded-md border border-border-default bg-bg-surface px-3 py-2 font-mono text-xs text-text-secondary">
              securenotes.app/share/k3J9-mQ2pXz
            </code>
            <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
              Access key
            </div>
            <code className="font-mono text-base font-bold tracking-wider text-accent-primary">
              8F3A-2C1D
            </code>
          </div>
          <div className="mt-4 flex justify-between font-mono text-xs text-text-muted">
            <span>views: 0</span>
            <span>one-time / password</span>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="mx-auto max-w-6xl border-t border-border-default px-6 py-20"
      >
        <div className="mb-12 max-w-lg">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-accent-primary">
            Features
          </div>
          <h2 className="mb-3 text-3xl font-semibold">
            Built around edge cases, not just the happy path
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Every state a share link can end up in is handled explicitly, with
            no silent fallthrough.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {edgeCases.map(({ icon: Icon, label, note }) => (
            <div
              key={label}
              className="rounded-lg border border-border-default bg-bg-surface p-5 transition hover:bg-bg-surface-raised"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-bg-surface-raised">
                <Icon className="h-4 w-4 text-accent-primary" aria-hidden="true" />
              </div>
              <div className="mb-1 text-sm font-semibold">{label}</div>
              <div className="text-[13px] leading-relaxed text-text-muted">
                {note}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="how-it-works"
        className="mx-auto max-w-6xl border-t border-border-default px-6 py-20"
      >
        <div className="mb-12 max-w-lg">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-accent-primary">
            How it works
          </div>
          <h2 className="text-3xl font-semibold">
            From note to sealed link in four steps
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {steps.map((step) => (
            <div key={step.n}>
              <div className="mb-3 font-mono text-2xl text-accent-primary">
                {step.n}
              </div>
              <div className="mb-2 text-lg font-semibold">{step.title}</div>
              <div className="text-[13px] leading-relaxed text-text-muted">
                {step.body}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border-default bg-bg-surface py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-bg-surface-raised">
            <ShieldCheck className="h-6 w-6 text-accent-primary" aria-hidden="true" />
          </div>
          <h3 className="text-base font-semibold">Secure Notes</h3>
          <p className="max-w-md text-sm leading-6 text-text-secondary">
            Securely create, share, and protect your notes with one-time or
            time-limited access.
          </p>
          <p className="text-xs text-text-muted">
            {new Date().getFullYear()} Secure Notes
          </p>
        </div>
      </footer>
    </main>
  );
}
