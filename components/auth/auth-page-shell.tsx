"use client"

import type { ReactNode } from "react";
import { Eye, Link2, ShieldCheck } from "lucide-react";

const authFeatures = [
  {
    icon: ShieldCheck,
    title: "Secure sharing",
    description: "Notes are only accessible through share links and explicit access rules.",
  },
  {
    icon: Link2,
    title: "Link-based access",
    description: "Create one-time, expiring, or password-locked note links.",
  },
  {
    icon: Eye,
    title: "View tracking",
    description: "Every successful access increments the note view count exactly once.",
  },
];

type AuthPageShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthPageShell({ title, subtitle, children }: AuthPageShellProps) {
  return (
    <main className="min-h-screen bg-bg-base text-text-primary">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden overflow-hidden border-r border-border-default bg-bg-surface p-10 lg:flex lg:flex-col lg:justify-center lg:gap-10">
          <div className="rounded-[2rem] border border-border-default bg-bg-base p-8 shadow-sm">
            <div className="mb-8 h-72 overflow-hidden rounded-[1.75rem] border border-border-default bg-gradient-to-br from-[var(--accent-primary)]/10 via-[var(--bg-surface-raised)] to-[var(--bg-base)]">
              <div className="flex h-full items-center justify-center text-sm font-semibold uppercase tracking-[0.25em] text-text-secondary">
                Illustration
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-semibold leading-tight text-text-primary">{title}</h1>
              <p className="max-w-sm text-sm leading-relaxed text-text-secondary">{subtitle}</p>
            </div>
          </div>

          <div className="grid gap-4">
            {authFeatures.map(({ icon: Icon, title: featureTitle, description }) => (
              <div
                key={featureTitle}
                className="rounded-3xl border border-border-default bg-bg-surface p-5"
              >
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-bg-surface-raised text-accent-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="mb-2 text-base font-semibold text-text-primary">{featureTitle}</h2>
                <p className="text-sm leading-relaxed text-text-secondary">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center bg-bg-base px-6 py-10">
          <div className="w-full max-w-[420px] rounded-[2rem] border border-border-default bg-bg-surface p-8 shadow-sm">
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
