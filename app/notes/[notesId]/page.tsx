import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@clerk/nextjs/server";

import {
  WorkspaceSharing,
  type WorkspaceShareLink,
} from "@/components/editor/workspace-sharing";
import prisma from "@/lib/prisma";

export default async function NoteWorkspacePage({
  params,
}: {
  params: Promise<{ notesId: string }>;
}) {
  const { notesId } = await params;
  const { userId } = await auth();

  if (!userId) {
    notFound();
  }

  const note = await prisma.project.findFirst({
    where: {
      id: notesId,
      ownerId: userId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!note) {
    notFound();
  }

  const shareLinks = await prisma.shareLink.findMany({
    where: { projectId: note.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      token: true,
      shareType: true,
      accessType: true,
      expiryAt: true,
      viewCount: true,
      usedAt: true,
      revokedAt: true,
      createdAt: true,
    },
  });

  const normalizedShareLinks = shareLinks.map((link) => ({
    ...link,
    expiryAt: link.expiryAt ? link.expiryAt.toISOString() : null,
    usedAt: link.usedAt ? link.usedAt.toISOString() : null,
    revokedAt: link.revokedAt ? link.revokedAt.toISOString() : null,
    createdAt: link.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-bg-base px-6 py-16 text-text-primary">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 rounded-2xl border border-border-default bg-bg-surface p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent-primary">
            Workspace
          </p>
          <h1 className="text-3xl font-semibold">{note.name}</h1>
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent-primary">
            Content
          </p>
          <div className="rounded-xl border border-border-default bg-bg-surface-raised p-4 text-sm leading-7 text-text-primary whitespace-pre-wrap">
            {note.content?.trim()
              ? note.content
              : "No content available for this note."}
          </div>
          <p className="text-sm leading-7 text-text-secondary">
            {note.description ??
              "A secure workspace for your notes and shared context."}
          </p>
        </div>

        <WorkspaceSharing
          projectId={note.id}
          initialLinks={normalizedShareLinks as WorkspaceShareLink[]}
        />

        <div className="flex items-center gap-3">
          <Link
            href="/editor"
            className="text-sm font-medium text-accent-primary"
          >
            Back to editor home
          </Link>
        </div>
      </div>
    </main>
  );
}
