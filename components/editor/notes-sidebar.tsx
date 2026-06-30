"use client"

import Link from "next/link"
import { FileText, PanelLeftClose, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type NotesSidebarItem = {
  id: string
  title: string
}

type NotesSidebarProps = {
  isOpen: boolean
  notes?: NotesSidebarItem[]
  onClose?: () => void
  className?: string
}

function NotesSidebar({
  isOpen,
  notes = [],
  onClose,
  className,
}: NotesSidebarProps) {
  return (
    <aside
      aria-label="My notes"
      aria-hidden={!isOpen}
      className={cn(
        "fixed top-14 bottom-0 left-0 z-40 flex w-80 max-w-[calc(100vw-1rem)] flex-col border-r border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xl transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "pointer-events-none -translate-x-full",
        className
      )}
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[var(--border-default)] px-4">
        <h2 className="text-sm font-semibold">My Notes</h2>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Close notes sidebar"
          onClick={onClose}
        >
          <PanelLeftClose className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {notes.length > 0 ? (
          <nav className="flex flex-col gap-1 p-3" aria-label="Owned notes">
            {notes.map((note) => (
              <Link
                key={note.id}
                href={`/notes/${note.id}`}
                className="flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-surface-raised)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
              >
                <FileText
                  className="h-4 w-4 shrink-0 text-[var(--text-muted)]"
                  aria-hidden="true"
                />
                <span className="min-w-0 truncate">{note.title}</span>
              </Link>
            ))}
          </nav>
        ) : (
          <div className="flex h-full min-h-48 flex-col items-center justify-center gap-2 px-6 text-center">
            <FileText
              className="h-6 w-6 text-[var(--text-faint)]"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              No notes yet
            </p>
            <p className="text-xs leading-5 text-[var(--text-muted)]">
              Create your first secure note to see it here.
            </p>
          </div>
        )}
      </ScrollArea>

      <div className="border-t border-[var(--border-default)] p-3">
        <Button asChild className="w-full justify-center gap-2">
          <Link href="/notes/new">
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Note
          </Link>
        </Button>
      </div>
    </aside>
  )
}

export { NotesSidebar }
export type { NotesSidebarItem, NotesSidebarProps }
