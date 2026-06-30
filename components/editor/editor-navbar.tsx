"use client"

import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type EditorNavbarProps = {
  isSidebarOpen: boolean
  onToggleSidebar: () => void
  centerContent?: ReactNode
  className?: string
}

function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  centerContent,
  className,
}: EditorNavbarProps) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen

  return (
    <header
      className={cn(
        "grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-[var(--text-primary)]",
        className
      )}
    >
      <div className="flex items-center justify-start">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={isSidebarOpen ? "Close notes sidebar" : "Open notes sidebar"}
          aria-pressed={isSidebarOpen}
          onClick={onToggleSidebar}
        >
          <SidebarIcon className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>

      <div className="min-w-0 text-center text-sm font-medium text-[var(--text-secondary)]">
        {centerContent}
      </div>

      <div className="flex items-center justify-end" aria-hidden="true" />
    </header>
  )
}

export { EditorNavbar }
export type { EditorNavbarProps }
