import { auth, currentUser } from '@clerk/nextjs/server'

import prisma from './prisma'

export type EditorProjectSummary = {
  id: string
  title: string
  owned: boolean
  sharedBy?: string
  members?: number
}

function toProjectSummary(
  project: { id: string; name: string },
  owned: boolean,
): EditorProjectSummary {
  return {
    id: project.id,
    title: project.name,
    owned,
    sharedBy: owned ? undefined : 'Shared workspace',
  }
}

export async function getEditorProjects() {
  const { userId } = await auth()

  if (!userId) {
    return {
      ownedProjects: [] as EditorProjectSummary[],
      sharedProjects: [] as EditorProjectSummary[],
    }
  }

  const [ownedProjects, clerkUser] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true },
    }),
    currentUser(),
  ])

  const primaryEmail = clerkUser?.emailAddresses.find((email) => email.id === clerkUser.primaryEmailAddressId)?.emailAddress
    ?? clerkUser?.emailAddresses[0]?.emailAddress
    ?? null

  const sharedProjects = primaryEmail
    ? await prisma.project.findMany({
        where: {
          collaborators: {
            some: {
              collaboratorEmail: primaryEmail,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true },
      })
    : []

  return {
    ownedProjects: ownedProjects.map((project) => toProjectSummary(project, true)),
    sharedProjects: sharedProjects.map((project) => toProjectSummary(project, false)),
  }
}
