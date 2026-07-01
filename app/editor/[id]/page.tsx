import { redirect } from 'next/navigation'

import { AccessDenied } from '@/components/editor/access-denied'
import { getProjectAccessIdentity, hasProjectAccess } from '@/lib/project-access'
import prisma from '@/lib/prisma'

export default async function EditorWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const identity = await getProjectAccessIdentity()

  if (!identity.userId) {
    redirect('/login')
  }

  const canAccess = await hasProjectAccess(id, identity)

  if (!canAccess) {
    return <AccessDenied />
  }

  const project = await prisma.project.findFirst({
    where: {
      id,
      OR: [
        { ownerId: identity.userId },
        {
          collaborators: {
            some: {
              collaboratorEmail: identity.primaryEmail ?? undefined,
            },
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      ownerId: true,
      description: true,
    },
  })

  if (!project) {
    return <AccessDenied />
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-text-primary">
      <header className="flex h-14 items-center justify-between border-b border-border-default bg-bg-surface px-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">Workspace</p>
          <h1 className="truncate text-sm font-semibold">{project.name}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-border-default bg-bg-surface-raised px-3 py-2 text-sm text-text-primary"
          >
            Share
          </button>
          <button
            type="button"
            className="rounded-md border border-border-default bg-bg-surface-raised px-3 py-2 text-sm text-text-primary"
          >
            AI Sidebar
          </button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden w-72 shrink-0 border-r border-border-default bg-bg-surface px-4 py-4 lg:block">
          <div className="rounded-xl border border-border-default bg-bg-surface-raised p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">Rooms</p>
            <div className="mt-3 rounded-lg border border-accent-primary/40 bg-accent-primary/10 px-3 py-2 text-sm font-medium text-accent-primary">
              {project.name}
            </div>
          </div>
        </aside>

        <main className="flex flex-1 flex-col bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_55%)]">
          <div className="flex flex-1 items-center justify-center px-8 py-10">
            <div className="max-w-xl rounded-2xl border border-border-default bg-bg-surface/80 px-8 py-10 text-center shadow-sm backdrop-blur">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent-primary">Canvas</p>
              <h2 className="mt-3 text-2xl font-semibold">Your workspace is ready</h2>
              <p className="mt-3 text-sm leading-7 text-text-secondary">
                This shell is now rendering with the active project context. Canvas logic and AI chat will come next.
              </p>
            </div>
          </div>
        </main>

        <aside className="hidden w-80 shrink-0 border-l border-border-default bg-bg-surface px-4 py-4 xl:block">
          <div className="rounded-xl border border-border-default bg-bg-surface-raised p-4">
            <p className="text-sm font-semibold">AI assistant</p>
            <p className="mt-2 text-sm leading-7 text-text-secondary">
              This sidebar is reserved for future AI chat and suggestions.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}
