import { redirect } from 'next/navigation'

import { AccessDenied } from '@/components/editor/access-denied'
import { WorkspaceEditor } from '@/components/editor/workspace-editor'
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
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!project) {
    return <AccessDenied />
  }

  const isOwner = project.ownerId === identity.userId

  const [collaborators, shareLinks] = await Promise.all([
    prisma.projectCollaborator.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, collaboratorEmail: true, createdAt: true },
    }),
    prisma.shareLink.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        token: true,
        shareType: true,
        accessType: true,
        expiryAt: true,
        viewCount: true,
        usedAt: true,
        revokedAt: true,
        createdAt: true,
      },
    }),
  ])

  const normalizedCollaborators = collaborators.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }))

  const normalizedShareLinks = shareLinks.map((link) => ({
    ...link,
    expiryAt: link.expiryAt ? link.expiryAt.toISOString() : null,
    usedAt: link.usedAt ? link.usedAt.toISOString() : null,
    revokedAt: link.revokedAt ? link.revokedAt.toISOString() : null,
    createdAt: link.createdAt.toISOString(),
  }))

  return (
    <WorkspaceEditor
      projectId={project.id}
      projectName={project.name}
      initialContent={project.content}
      createdAt={project.createdAt.toISOString()}
      updatedAt={project.updatedAt.toISOString()}
      isOwner={isOwner}
      initialCollaborators={normalizedCollaborators}
      initialShareLinks={normalizedShareLinks}
    />
  )
}
