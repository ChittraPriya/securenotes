import Link from 'next/link'
import { notFound } from 'next/navigation'

import { auth } from '@clerk/nextjs/server'

import prisma from '@/lib/prisma'

export default async function NoteWorkspacePage({
  params,
}: {
  params: Promise<{ notesId: string }>
}) {
  const { notesId } = await params
  const { userId } = await auth()

  if (!userId) {
    notFound()
  }

  const project = await prisma.project.findFirst({
    where: {
      id: notesId,
      ownerId: userId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!project) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-bg-base px-6 py-16 text-text-primary">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-2xl border border-border-default bg-bg-surface p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent-primary">Workspace</p>
          <h1 className="text-3xl font-semibold">{project.name}</h1>
          <p className="text-sm leading-7 text-text-secondary">
            {project.description ?? 'A secure workspace for your notes and shared context.'}
          </p>
        </div>

        <div className="rounded-xl border border-border-default bg-bg-surface-raised p-4 text-sm text-text-secondary">
          <p className="font-medium text-text-primary">Project ID</p>
          <p className="mt-1 font-mono text-xs">{project.id}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/editor" className="text-sm font-medium text-accent-primary">
            Back to editor home
          </Link>
        </div>
      </div>
    </main>
  )
}
