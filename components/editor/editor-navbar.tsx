"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { ReactNode } from "react";
import { UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EditorNavbarProps = {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  centerContent?: ReactNode;
  className?: string;
};

export function EditorNavbar({
  isSidebarOpen,
  onToggleSidebar,
  centerContent,
  className,
}: EditorNavbarProps) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen;

  return (
    <header
      className={cn(
        "grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-[var(--border-default)] bg-[var(--bg-surface)] px-3 text-[var(--text-primary)]",
        className
      )}
    >
      {/* Left */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-pressed={isSidebarOpen}
          onClick={onToggleSidebar}
        >
          <SidebarIcon className="h-5 w-5" aria-hidden="true" />
        </Button>

        <span className="hidden sm:block text-sm font-semibold">
          Secure Notes
        </span>
      </div>

      {/* Center */}
      <div className="min-w-0 text-center text-sm font-medium text-[var(--text-secondary)] hidden md:block">
        {centerContent}
      </div>

      {/* Right */}
      <div className="flex items-center justify-end">
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-9 w-9",
            },
          }}
        />
      </div>
    </header>
  );
}