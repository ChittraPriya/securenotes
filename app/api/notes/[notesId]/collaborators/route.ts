import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import {
  addCollaboratorSchema,
  removeCollaboratorSchema,
} from "@/lib/schemas";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ notesId: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { notesId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: notesId },
    select: { id: true, ownerId: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const collaborators = await prisma.projectCollaborator.findMany({
    where: { projectId: notesId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      collaboratorEmail: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    collaborators: collaborators.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ notesId: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { notesId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = addCollaboratorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { email } = parsed.data;

  const project = await prisma.project.findUnique({
    where: { id: notesId },
    select: { id: true, ownerId: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const collaborator = await prisma.projectCollaborator.create({
      data: {
        projectId: notesId,
        collaboratorEmail: email,
      },
      select: {
        id: true,
        collaboratorEmail: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        collaborator: {
          ...collaborator,
          createdAt: collaborator.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "This email is already a collaborator" },
        { status: 409 }
      );
    }
    throw error;
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ notesId: string }> }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { notesId } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = removeCollaboratorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { email } = parsed.data;

  const project = await prisma.project.findUnique({
    where: { id: notesId },
    select: { id: true, ownerId: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  if (project.ownerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const deleted = await prisma.projectCollaborator.deleteMany({
    where: {
      projectId: notesId,
      collaboratorEmail: email,
    },
  });

  if (deleted.count === 0) {
    return NextResponse.json(
      { error: "Collaborator not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}
