import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

import prisma from '@/lib/prisma'
import { createNoteSchema } from '@/lib/schemas'

function getProjectSelection() {
  return {
    id: true,
    name: true,
    description: true,
    content: true,
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

  const input = createNoteSchema.parse(body)

  const project = await prisma.project.create({
    data: {
      ownerId: userId,
      name: input.name,
      description: input.description,
      content: input.content,
    },
    select: getProjectSelection(),
  })

  return NextResponse.json(project, { status: 201 })
}
