import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'

function getProjectSelection() {
  return {
    id: true,
    name: true,
    description: true,
    status: true,
    canvasIsonPath: true,
    createdAt: true,
    updatedAt: true,
  } as const
}

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const notes = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
    select: getProjectSelection(),
  })

  return NextResponse.json(notes)
}

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
  const rawName = parsedBody.name
  const rawDescription = parsedBody.description

  const name = typeof rawName === 'string' && rawName.trim() !== '' ? rawName.trim() : 'Untitled Project'
  const description = typeof rawDescription === 'string' ? rawDescription : null

  const project = await prisma.project.create({
    data: {
      ownerId: userId,
      name,
      description,
    },
    select: getProjectSelection(),
  })

  return NextResponse.json(project, { status: 201 })
}
