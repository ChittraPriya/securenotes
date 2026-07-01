"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { EditorProjectSummary } from "@/lib/notes";

export type ProjectActionDialog = "create" | "rename" | "delete" | null;

function slugifyProjectName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function createRoomId(name: string) {
  const baseSlug = slugifyProjectName(name);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${baseSlug || "new-note"}-${suffix}`;
}

export function useProjectActions(
  initialOwnedProjects: EditorProjectSummary[] = [],
  initialSharedProjects: EditorProjectSummary[] = [],
) {
  const router = useRouter();
  const [ownedProjects, setOwnedProjects] =
    useState<EditorProjectSummary[]>(initialOwnedProjects);
  const [sharedProjects, setSharedProjects] = useState<EditorProjectSummary[]>(
    initialSharedProjects,
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [dialog, setDialog] = useState<ProjectActionDialog>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [nameInput, setNameInput] = useState("");
  const [loading, setLoading] = useState(false);

  const activeProject = useMemo(
    () =>
      [...ownedProjects, ...sharedProjects].find(
        (project) => project.id === selectedProjectId,
      ) ?? null,
    [ownedProjects, selectedProjectId, sharedProjects],
  );

  const roomIdPreview = useMemo(() => createRoomId(nameInput), [nameInput]);

  const openCreateDialog = () => {
    setSelectedProjectId(null);
    setNameInput("");
    setDialog("create");
  };

  const openRenameDialog = (project: EditorProjectSummary) => {
  console.log("Rename project:", project);

  if (!project.owned) return;

  setSelectedProjectId(project.id);
  setNameInput(project.title);
  setDialog("rename");
};

  const openDeleteDialog = (project: EditorProjectSummary) => {
    if (!project.owned) return;
    setSelectedProjectId(project.id);
    setDialog("delete");
  };

  const closeDialog = () => {
    setDialog(null);
    setSelectedProjectId(null);
    setNameInput("");
    setLoading(false);
  };

  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen((current) => !current);

  const refreshProjects = async () => {
    const response = await fetch("/api/notes", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as Array<{ id: string; name: string }>;
    setOwnedProjects(
      data.map((project) => ({
        id: project.id,
        title: project.name,
        owned: true,
      })),
    );
  };

  const createProject = async (content: string) => {
    if (!nameInput.trim()) return { redirectTo: null as string | null };

    setLoading(true);

    try {
      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: nameInput.trim(),
          content: content, 
         }),
      });

      if (!response.ok) {
        throw new Error("Failed to create notes");
      }

      const createdProject = (await response.json()) as {
        id: string;
        name: string;
      };
      const roomId = createRoomId(nameInput.trim());
      await refreshProjects();
      closeDialog();
      const redirectTo = `/notes/${createdProject.id}?roomId=${roomId}`;
      router.push(redirectTo);
      return { redirectTo };
    } finally {
      setLoading(false);
    }
  };
const renameProject = async () => {
  console.log("selectedProjectId:", selectedProjectId);
  console.log("nameInput:", nameInput);

  if (!selectedProjectId || !nameInput.trim()) return;

  setLoading(true);

  try {
    const response = await fetch(`/api/notes/${selectedProjectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameInput.trim() }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Rename API error:", errorText);
      throw new Error(errorText || "Failed to rename note");
    }

    await refreshProjects();
    closeDialog();
  } finally {
    setLoading(false);
  }
};

  const deleteProject = async () => {
  if (!selectedProjectId) return;

  setLoading(true);

  try {
    const response = await fetch(`/api/notes/${selectedProjectId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.log("Delete API error:", errorText);

      throw new Error(errorText || "Failed to delete note");
    }

    // Remove deleted note from UI immediately
    setOwnedProjects((currentProjects) =>
      currentProjects.filter(
        (project) => project.id !== selectedProjectId
      )
    );

    closeDialog();

    if (activeProject?.id === selectedProjectId) {
      router.replace("/editor");
      return;
    }


    await refreshProjects();
    router.refresh();
    closeDialog();
  } finally {
    setLoading(false);
  }
};
  return {
    ownedProjects,
    sharedProjects,
    dialog,
    activeProject,
    roomIdPreview,
    nameInput,
    loading,
    isSidebarOpen,
    openCreateDialog,
    openRenameDialog,
    openDeleteDialog,
    closeDialog,
    closeSidebar,
    toggleSidebar,
    setNameInput,
    createProject,
    renameProject,
    deleteProject,
  };
}
