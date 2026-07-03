import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { updateNoteSchema } from "@/lib/schemas"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ notesId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { notesId } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const parsed = updateNoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    const input = parsed.data;

    const project = await prisma.project.findUnique({
      where: {
        id: notesId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.ownerId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const updateData: Record<string, string> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.content !== undefined) updateData.content = input.content;

    const updatedProject = await prisma.project.update({
      where: {
        id: notesId,
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      project: updatedProject,
    });

  } catch (error) {
    console.error("UPDATE NOTE ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to update note",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ notesId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { notesId } = await params;

    console.log("Deleting project:", notesId);

    const project = await prisma.project.findUnique({
      where: {
        id: notesId,
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    await prisma.$transaction([
      prisma.shareLink.deleteMany({
        where: {
          projectId: notesId,
        },
      }),

      prisma.project.delete({
        where: {
          id: notesId,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error("DELETE NOTE ERROR:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Delete failed",
      },
      { status: 500 }
    );
  }
}