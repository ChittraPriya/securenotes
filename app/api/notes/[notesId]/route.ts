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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ notesId: string }> },
) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { notesId } = await params

  let body: unknown

  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const parsedBody = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {}
  const rawName = parsedBody.name

  if (typeof rawName !== 'string' || rawName.trim() === '') {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const existingProject = await prisma.project.findUnique({
    where: { id: notesId },
    select: { id: true, ownerId: true },
  })

  if (!existingProject) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (existingProject.ownerId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const updatedProject = await prisma.project.update({
    where: { id: notesId },
    data: { name: rawName.trim() },
    select: getProjectSelection(),
  })

  return NextResponse.json(updatedProject)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ notesId: string }> },
) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { notesId } = await params

  const existingProject = await prisma.project.findUnique({
    where: { id: notesId },
    select: { id: true, ownerId: true },
  })

  if (!existingProject) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (existingProject.ownerId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.project.delete({
    where: { id: notesId },
  })

  return new NextResponse(null, { status: 204 })
}
