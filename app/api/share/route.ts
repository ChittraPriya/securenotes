import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { createShareLink } from '@/lib/share-link'
import { createShareSchema } from '@/lib/schemas'

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const parsed = createShareSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    )
  }

  const input = parsed.data

  const project = await prisma.project.findFirst({
    where: {
      id: input.projectId,
      ownerId: userId,
    },
    select: { id: true },
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
  }

  const expiryAt = input.expiryAt ? new Date(input.expiryAt) : null

  const createdShare = await createShareLink({
    projectId: project.id,
    shareType: input.shareType,
    accessType: input.accessType,
    expiryAt,
    password: input.password,
  })

  return NextResponse.json(
    {
      shareUrl: createdShare.shareUrl,
      password: createdShare.password ?? null,
      shareLink: {
        token: createdShare.token,
        shareType: input.shareType,
        accessType: input.accessType,
        expiryAt: createdShare.shareLink.expiryAt,
      },
    },
    { status: 201 }
  )
}
