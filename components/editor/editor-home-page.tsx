"use client"

import { useMemo } from "react"
import { Plus, FileText } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { NotesSidebar } from "@/components/editor/notes-sidebar"
import { useProjectActions } from "@/hooks/use-project-actions"
import type { EditorProjectSummary } from "@/lib/notes"
import { cn } from "@/lib/utils"

type EditorHomePageProps = {
  ownedProjects: EditorProjectSummary[]
  sharedProjects: EditorProjectSummary[]
}

export function EditorHomePage({ ownedProjects, sharedProjects }: EditorHomePageProps) {
  const router = useRouter()
  const {
    ownedProjects: ownedProjectsState,
    sharedProjects: sharedProjectsState,
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
  } = useProjectActions(ownedProjects, sharedProjects)

  const createButtonLabel = useMemo(() => (loading ? "Creating…" : "Create note"), [loading])
  const renameButtonLabel = useMemo(() => (loading ? "Saving…" : "Save changes"), [loading])
  const deleteButtonLabel = useMemo(() => (loading ? "Deleting…" : "Delete note"), [loading])

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        centerContent="Your notes"
      />

      {isSidebarOpen ? (
        <div className="fixed inset-0 z-30 bg-black/20 md:hidden" onClick={closeSidebar} />
      ) : null}

      <div className="relative md:flex md:items-start">
        <NotesSidebar
          isOpen={isSidebarOpen}
          ownedProjects={ownedProjectsState}
          sharedProjects={sharedProjectsState}
          onClose={closeSidebar}
          onCreate={openCreateDialog}
          onRename={openRenameDialog}
          onDelete={openDeleteDialog}
          className="md:sticky md:top-14 md:h-[calc(100vh-3.5rem)]"
        />

        <main
          className={cn(
            "flex-1 px-6 py-10 transition-all duration-300",
            isSidebarOpen ? "md:pl-80" : "md:pl-6",
          )}
        >
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
              Add a title and preview the workspace room ID as you type.
            </DialogDescription>
          </DialogHeader>

          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              void createProject().then((result) => {
                if (result?.redirectTo) {
                  router.push(result.redirectTo)
                }
              })
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
                Room ID preview: <span className="font-mono text-text-primary">{roomIdPreview}</span>
              </p>
            </div>

            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={closeDialog} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {createButtonLabel}
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
              Rename the workspace titled “{activeProject?.title}”. Press Enter to submit.
            </DialogDescription>
          </DialogHeader>

          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              void renameProject()
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
                {renameButtonLabel}
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
              This will permanently delete “{activeProject?.title}”.
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
              <Button type="button" variant="destructive" onClick={() => void deleteProject()} disabled={loading}>
                {deleteButtonLabel}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
