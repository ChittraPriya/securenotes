"use client";

import { useState } from "react";
import { Mail, Trash2, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type WorkspaceCollaborator = {
  id: string;
  collaboratorEmail: string;
  createdAt: string;
};

type WorkspaceCollaboratorsProps = {
  projectId: string;
  initialCollaborators: WorkspaceCollaborator[];
};

export function WorkspaceCollaborators({
  projectId,
  initialCollaborators,
}: WorkspaceCollaboratorsProps) {
  const [collaborators, setCollaborators] = useState(initialCollaborators);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleAdd() {
    setIsAdding(true);
    setMessage(null);

    try {
      const response = await fetch(
        `/api/notes/${projectId}/collaborators`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to add collaborator");
      }

      setCollaborators((current) => [data.collaborator, ...current]);
      setEmail("");
      setOpen(false);
      setMessage("Collaborator added successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to add collaborator"
      );
    } finally {
      setIsAdding(false);
    }
  }

  async function handleRemove(emailToRemove: string) {
    try {
      const response = await fetch(
        `/api/notes/${projectId}/collaborators`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailToRemove }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Unable to remove collaborator");
      }

      setCollaborators((current) =>
        current.filter((c) => c.collaboratorEmail !== emailToRemove)
      );

      setMessage("Collaborator removed.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to remove collaborator"
      );
    }
  }

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface-raised p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">
            Collaborators
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Add people by email to give them access to this workspace.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">
              <UserPlus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add collaborator</DialogTitle>
              <DialogDescription>
                Enter the email address of the person you want to invite.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-2">
              <Label htmlFor="collaborator-email">Email address</Label>
              <Input
                id="collaborator-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="colleague@example.com"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAdd}
                disabled={isAdding || !email.trim()}
              >
                {isAdding ? "Adding…" : "Add collaborator"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {message ? (
        <p className="mt-3 text-sm text-accent-primary">{message}</p>
      ) : null}

      <div className="mt-4 space-y-3">
        {collaborators.length === 0 ? (
          <p className="text-sm text-text-secondary">
            No collaborators yet. Invite someone by email.
          </p>
        ) : (
          collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="flex items-center justify-between rounded-lg border border-border-default bg-bg-surface p-3 text-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Mail className="h-4 w-4 shrink-0 text-text-muted" />
                <div className="min-w-0">
                  <p className="truncate font-medium text-text-primary">
                    {collaborator.collaboratorEmail}
                  </p>
                  <p className="text-xs text-text-muted">
                    Added{" "}
                    {new Date(collaborator.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleRemove(collaborator.collaboratorEmail)}
                className="shrink-0 text-text-muted hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
