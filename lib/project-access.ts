import { auth, currentUser } from '@clerk/nextjs/server'

import prisma from './prisma'

export type ProjectAccessIdentity = {
  userId: string | null
  primaryEmail: string | null
}

export async function getProjectAccessIdentity(): Promise<ProjectAccessIdentity> {
  const { userId } = await auth()

  if (!userId) {
    return { userId: null, primaryEmail: null }
  }

  const clerkUser = await currentUser()
  const primaryEmail = clerkUser?.emailAddresses.find((email) => email.id === clerkUser.primaryEmailAddressId)?.emailAddress
    ?? clerkUser?.emailAddresses[0]?.emailAddress
    ?? null

  return { userId, primaryEmail }
}

export async function hasProjectAccess(projectId: string, identity: ProjectAccessIdentity) {
  if (!identity.userId) {
    return false
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
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
    select: { id: true },
  })

  return Boolean(project)
}
