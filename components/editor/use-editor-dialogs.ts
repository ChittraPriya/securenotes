import { useMemo, useState } from "react"

export type EditorNote = {
  id: string
  title: string
  owned: boolean
}

type EditorDialog = "create" | "rename" | "delete" | null

export function useEditorDialogs(initialNotes: EditorNote[] = []) {
  const [notes, setNotes] = useState<EditorNote[]>(initialNotes)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [dialog, setDialog] = useState<EditorDialog>(null)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [nameInput, setNameInput] = useState("")
  const [loading, setLoading] = useState(false)

  const activeNote = useMemo(
    () => notes.find((note) => note.id === selectedNoteId) ?? null,
    [notes, selectedNoteId]
  )

  const slugPreview = useMemo(
    () =>
      nameInput
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, ""),
    [nameInput]
  )

  const openCreateDialog = () => {
    setSelectedNoteId(null)
    setNameInput("")
    setDialog("create")
  }

  const openRenameDialog = (note: EditorNote) => {
    if (!note.owned) return
    setSelectedNoteId(note.id)
    setNameInput(note.title)
    setDialog("rename")
  }

  const openDeleteDialog = (note: EditorNote) => {
    if (!note.owned) return
    setSelectedNoteId(note.id)
    setDialog("delete")
  }

  const closeDialog = () => {
    setDialog(null)
    setSelectedNoteId(null)
    setNameInput("")
    setLoading(false)
  }

  const closeSidebar = () => setIsSidebarOpen(false)
  const toggleSidebar = () => setIsSidebarOpen((current) => !current)

  const createNote = async () => {
  if (!nameInput.trim()) return;

  setLoading(true);

  try {
    const response = await fetch("/api/notes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: nameInput.trim(),
        content: "",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create note");
    }

    const createdNote = await response.json();

    setNotes((currentNotes) => [
      ...currentNotes,
      {
        id: createdNote.id,
        title: createdNote.name,
        owned: true,
      },
    ]);

    closeDialog();
  } catch (error) {
    console.error("Create note error:", error);
  } finally {
    setLoading(false);
  }
};
  const renameNote = async () => {
    if (!activeNote || !nameInput.trim()) return
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 250))
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === activeNote.id
          ? { ...note, title: nameInput.trim() }
          : note
      )
    )
    closeDialog()
  }

  const deleteNote = async () => {
    if (!activeNote) return
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 250))
    setNotes((currentNotes) =>
      currentNotes.filter((note) => note.id !== activeNote.id)
    )
    closeDialog()
  }

  return {
    notes,
    dialog,
    activeNote,
    slugPreview,
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
    createNote,
    renameNote,
    deleteNote,
  }
}
