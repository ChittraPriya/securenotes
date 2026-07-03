import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

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

    const body = await request.json();

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

    const updatedProject = await prisma.project.update({
      where: {
        id: notesId,
      },
      data: {
        ...(typeof body.name === "string" && {
          name: body.name.trim(),
        }),

        ...(typeof body.content === "string" && {
          content: body.content,
        }),
      },
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