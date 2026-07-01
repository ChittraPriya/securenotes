"use client";

import { useState } from "react";
import Link from "next/link";

import {
  FileText,
  PanelLeftClose,
  Plus,
  Users,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type NotesSidebarItem = {
  id: string;
  title: string;
  owned: boolean;
  sharedBy?: string;
  members?: number;
};

type NotesSidebarProps = {
  isOpen: boolean;
  ownedProjects?: NotesSidebarItem[];
  sharedProjects?: NotesSidebarItem[];
  notes?: NotesSidebarItem[];
  onClose?: () => void;
  onCreate?: () => void;
  onRename?: (note: NotesSidebarItem) => void;
  onDelete?: (note: NotesSidebarItem) => void;
  className?: string;
};

function NotesSidebar({
  isOpen,
  ownedProjects = [],
  sharedProjects = [],
  notes = [],
  onClose,
  onCreate,
  onRename,
  onDelete,
  className,
}: NotesSidebarProps) {
  const [activeTab, setActiveTab] = useState<"my" | "shared">("my");

  const myNotes = ownedProjects.length > 0 ? ownedProjects : notes.filter((note) => note.owned);

  const sharedNotes = sharedProjects.length > 0 ? sharedProjects : notes.filter((note) => !note.owned);

  return (
    <aside
      aria-label="Notes sidebar"
      aria-hidden={!isOpen}
      className={cn(
        `
        fixed top-14 bottom-0 left-0 z-40
        flex w-80 max-w-[calc(100vw-1rem)]
        flex-col
        border-r border-border-default
        bg-bg-surface
        text-text-primary
        shadow-xl
        transition-transform duration-200
        `,
        isOpen ? "translate-x-0" : "pointer-events-none -translate-x-full",

        className,
      )}
    >
      {/* Header */}

      <div
        className="
      border-b
      border-border-default
      px-4
      py-4
      "
      >
        <div
          className="
        mb-4
        flex
        items-center
        justify-between
        "
        >
          <h2
            className="
          text-sm
          font-semibold
          "
          >
            Notes
          </h2>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}

        <div
          className="
        flex
        rounded-lg
        bg-bg-surface-raised
        p-1
        "
        >
          <button
            onClick={() => setActiveTab("my")}
            className={cn(
              `
              flex-1
              rounded-md
              py-2
              text-sm
              transition
              `,
              activeTab === "my"
                ? "bg-bg-surface font-medium"
                : "text-text-secondary",
            )}
          >
            My Notes
          </button>

          <button
            onClick={() => setActiveTab("shared")}
            className={cn(
              `
              flex-1
              rounded-md
              py-2
              text-sm
              transition
              `,
              activeTab === "shared"
                ? "bg-bg-surface font-medium"
                : "text-text-secondary",
            )}
          >
            Shared
          </button>
        </div>
      </div>

      {/* Content */}

      <ScrollArea
        className="
      flex-1
      min-h-0
      "
      >
        <div className="p-3">
          {/* MY NOTES */}

          {activeTab === "my" && (
            <>
              <h3
                className="
          mb-3
          text-xs
          font-medium
          text-text-muted
          "
              >
                MY NOTES
              </h3>

              {myNotes.length > 0 ? (
                myNotes.map((note) => (
                  <div
                    key={note.id}
                    className="
                group
                mb-2
                flex
                items-center
                justify-between
                rounded-md
                px-3
                py-2
                text-sm
                hover:bg-bg-surface-raised
                "
                  >
                    <Link
                      href={`/notes/${note.id}`}
                      className="
                  flex
                  min-w-0
                  items-center
                  gap-2
                  "
                    >
                      <FileText
                        className="
                    h-4
                    w-4
                    text-text-muted
                    "
                      />

                      <span className="truncate">{note.title}</span>
                    </Link>

                    <div
                      className="
                hidden
                group-hover:flex
                gap-1
                "
                    >
                      <button
                        type="button"
                        onClick={() => onRename?.(note)}
                        className="
                    rounded-md
                    p-1.5
                    hover:bg-bg-surface
                    "
                      >
                        <Pencil className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete?.(note)}
                        className="
                    rounded-md
                    p-1.5
                    text-red-400
                    hover:bg-red-500/10
                    "
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p
                  className="
              text-sm
              text-text-muted
              "
                >
                  No notes yet
                </p>
              )}
            </>
          )}

          {/* SHARED NOTES */}

          {activeTab === "shared" && (
            <>
              <h3
                className="
          mb-3
          text-xs
          font-medium
          text-text-muted
          "
              >
                SHARED WITH ME
              </h3>

              {sharedNotes.length > 0 ? (
                sharedNotes.map((note) => (
                  <Link
                    key={note.id}
                    href={`/notes/${note.id}`}
                    className="
                mb-2
                flex
                items-center
                justify-between
                rounded-md
                px-3
                py-2
                hover:bg-bg-surface-raised
                "
                  >
                    <div
                      className="
                flex
                items-center
                gap-2
                "
                    >
                      <Users
                        className="
                    h-4
                    w-4
                    text-blue-400
                    "
                      />

                      <div>
                        <p className="text-sm">{note.title}</p>

                        <p
                          className="
                    text-xs
                    text-text-muted
                    "
                        >
                          From: {note.sharedBy}
                        </p>
                      </div>
                    </div>

                    {note.members && (
                      <span
                        className="
                  rounded
                  bg-bg-surface-raised
                  px-2
                  py-1
                  text-xs
                  "
                      >
                        👥 {note.members}
                      </span>
                    )}
                  </Link>
                ))
              ) : (
                <p
                  className="
              text-sm
              text-text-muted
              "
                >
                  No shared notes
                </p>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      {/* New Note */}

      <div
        className="
      border-t
      border-border-default
      p-3
      "
      >
        <Button
          type="button"
          className="
          w-full
          justify-center
          gap-2
          "
          onClick={onCreate}
        >
          <Plus className="h-4 w-4" />
          New Note
        </Button>
      </div>
    </aside>
  );
}

export { NotesSidebar };

export type { NotesSidebarItem, NotesSidebarProps };
