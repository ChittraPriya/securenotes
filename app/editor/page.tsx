"use client"

import { Plus, FileText, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { NotesSidebar } from "@/components/editor/notes-sidebar"
import { useEditorDialogs } from "@/components/editor/use-editor-dialogs"

const initialNotes = [
  { id: "note-1", title: "Architecture review notes", owned: true },
  { id: "note-2", title: "Shared requirements brief", owned: false },
  { id: "note-3", title: "Deployment checklist", owned: true },
]

export default function EditorPage() {
  const {
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
  } = useEditorDialogs(initialNotes)

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        centerContent="Your notes"
      />

      {isSidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={closeSidebar}
        />
      ) : null}

      <div className="relative md:flex md:items-start">
        <NotesSidebar
          isOpen={isSidebarOpen}
          notes={notes}
          onClose={closeSidebar}
          onCreate={openCreateDialog}
          onRename={openRenameDialog}
          onDelete={openDeleteDialog}
          className="md:sticky md:top-14 md:h-[calc(100vh-3.5rem)]"
        />

        <main className="flex-1 px-6 py-10 md:pl-[20rem]">
          <section className="mx-auto max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-accent-primary">
              <FileText className="h-4 w-4" aria-hidden="true" />
              Editor home
            </p>
            <h1 className="mb-4 text-3xl font-semibold leading-tight">
              Create a note or open an existing one
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-text-secondary">
              Start a new architecture workspace, or choose a project from the sidebar.
            </p>
            <div className="mt-10">
              <Button onClick={openCreateDialog} size="lg">
                <Plus className="h-4 w-4" aria-hidden="true" />
                New Note
              </Button>
            </div>
          </section>
        </main>
      </div>

      <Dialog open={dialog === "create"} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
        <DialogContent className="w-full max-w-lg">
          <DialogHeader>
            <DialogTitle>Create note</DialogTitle>
            <DialogDescription>
              Add a title and preview the note slug as you type.
            </DialogDescription>
          </DialogHeader>

          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              createNote()
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="note-name">Note name</Label>
              <Input
                id="note-name"
                autoFocus
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
                placeholder="My architecture note"
                disabled={loading}
              />
              <p className="text-sm text-text-secondary">
                Slug preview: <span className="font-mono text-text-primary">{slugPreview || "new-note"}</span>
              </p>
            </div>

            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={closeDialog} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create note"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "rename"} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
        <DialogContent className="w-full max-w-lg">
          <DialogHeader>
            <DialogTitle>Rename note</DialogTitle>
            <DialogDescription>
              Rename the note titled “{activeNote?.title}”. Press Enter to submit.
            </DialogDescription>
          </DialogHeader>

          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              renameNote()
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="rename-note-name">Note name</Label>
              <Input
                id="rename-note-name"
                autoFocus
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
                disabled={loading}
              />
            </div>

            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={closeDialog} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving…" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "delete"} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
        <DialogContent className="w-full max-w-lg">
          <DialogHeader>
            <DialogTitle>Delete note</DialogTitle>
            <DialogDescription>
              This will permanently delete “{activeNote?.title}”.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <p className="text-sm text-text-secondary">
              Are you sure you want to delete this note? This action cannot be reversed.
            </p>
            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={closeDialog} disabled={loading}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={deleteNote} disabled={loading}>
                {loading ? "Deleting…" : "Delete note"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
