"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ShareLinkError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-bg-base px-6 py-16 text-text-primary">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-2xl border border-border-default bg-bg-surface p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent-primary">
            Shared workspace
          </p>
          <h1 className="text-3xl font-semibold">Something went wrong</h1>
          <p className="text-sm leading-7 text-text-secondary">
            We encountered an unexpected error while loading this shared
            workspace. The link may be invalid or temporarily unavailable.
          </p>
          {error.digest ? (
            <p className="text-xs text-text-secondary/60">
              Error reference: {error.digest}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-border-default bg-bg-surface-raised p-4">
          <AlertTriangle className="h-4 w-4 shrink-0 text-accent-primary" />
          <p className="text-sm text-text-secondary">Try reloading the page or contact the person who shared this workspace.</p>
        </div>
        <Button onClick={reset} className="self-start">
          Try again
        </Button>
      </div>
    </main>
  );
}
