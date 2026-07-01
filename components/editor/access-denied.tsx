import Link from 'next/link'
import { Lock } from 'lucide-react'

export function AccessDenied() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-base px-6 py-16 text-text-primary">
      <div className="flex max-w-md flex-col items-center rounded-2xl border border-border-default bg-bg-surface px-8 py-10 text-center shadow-sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-bg-surface-raised text-accent-primary">
          <Lock className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-semibold">Access denied</h1>
        <p className="mt-2 text-sm leading-7 text-text-secondary">
          You do not have access to this workspace or it no longer exists.
        </p>
        <Link href="/editor" className="mt-6 text-sm font-medium text-accent-primary">
          Back to editor home
        </Link>
      </div>
    </main>
  )
}
