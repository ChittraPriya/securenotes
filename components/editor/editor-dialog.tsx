import type { ReactNode } from "react"

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type EditorDialogContentProps = {
  title: string
  description?: string
  footer?: ReactNode
  children?: ReactNode
  className?: string
}

function EditorDialogContent({
  title,
  description,
  footer,
  children,
  className,
}: EditorDialogContentProps) {
  return (
    <DialogContent
      className={cn(
        "border border-[var(--border-default)] bg-[var(--bg-elevated)] text-[var(--text-primary)]",
        className
      )}
    >
      <DialogHeader>
        <DialogTitle className="text-[var(--text-primary)]">
          {title}
        </DialogTitle>
        {description ? (
          <DialogDescription className="text-[var(--text-muted)]">
            {description}
          </DialogDescription>
        ) : null}
      </DialogHeader>

      {children}

      {footer ? (
        <DialogFooter className="border-[var(--border-default)] bg-[var(--bg-subtle)]">
          {footer}
        </DialogFooter>
      ) : null}
    </DialogContent>
  )
}

export { EditorDialogContent }
export type { EditorDialogContentProps }
