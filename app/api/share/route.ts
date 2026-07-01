import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { createShareLink } from '@/lib/share-link'

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

  const parsedBody = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {}
  const rawProjectId = parsedBody.projectId
  const rawShareType = parsedBody.shareType
  const rawAccessType = parsedBody.accessType
  const rawExpiryAt = parsedBody.expiryAt
  const rawPassword = parsedBody.password

  if (typeof rawProjectId !== 'string' || rawProjectId.trim() === '') {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
  }

  const project = await prisma.project.findFirst({
    where: {
      id: rawProjectId,
      ownerId: userId,
    },
    select: { id: true },
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found or access denied' }, { status: 404 })
  }

  const shareType = rawShareType === 'ONE_TIME' ? 'ONE_TIME' : 'TIME_BASED'
  const accessType = rawAccessType === 'PASSWORD' ? 'PASSWORD' : 'PUBLIC'

  let expiryAt: string | Date | null = null

  if (shareType === 'TIME_BASED') {
    if (typeof rawExpiryAt === 'string' && rawExpiryAt.trim() !== '') {
      const parsedExpiry = new Date(rawExpiryAt)
      if (Number.isNaN(parsedExpiry.getTime())) {
        return NextResponse.json({ error: 'expiryAt must be a valid date' }, { status: 400 })
      }
      expiryAt = parsedExpiry
    } else {
      return NextResponse.json({ error: 'expiryAt is required for time-based links' }, { status: 400 })
    }

    if (expiryAt instanceof Date && expiryAt <= new Date()) {
      return NextResponse.json({ error: 'expiryAt must be in the future' }, { status: 400 })
    }
  }

  const password = typeof rawPassword === 'string' ? rawPassword : undefined

  const createdShare = await createShareLink({
    projectId: project.id,
    shareType,
    accessType,
    expiryAt,
    password,
  })

  return NextResponse.json(
    {
      shareUrl: createdShare.shareUrl,
      password: createdShare.password ?? null,
      shareLink: {
        token: createdShare.token,
        shareType,
        accessType,
        expiryAt: createdShare.shareLink.expiryAt,
      },
    },
    { status: 201 }
  )
}
