"use client";

import { useMemo, useState } from "react";
import { Copy, KeyRound, Link2, ShieldOff, TimerReset } from "lucide-react";

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

export type WorkspaceShareLink = {
  id: string;
  token: string;
  shareType: "ONE_TIME" | "TIME_BASED";
  accessType: "PUBLIC" | "PASSWORD";
  expiryAt: string | null;
  viewCount: number;
  usedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

function normalizeShareLink(link: WorkspaceShareLink) {
  return {
    ...link,
    expiryAt: link.expiryAt ? new Date(link.expiryAt).toISOString() : null,
    createdAt: link.createdAt
      ? new Date(link.createdAt).toISOString()
      : new Date().toISOString(),
  };
}

type WorkspaceSharingProps = {
  projectId: string;
  initialLinks: WorkspaceShareLink[];
};

export function WorkspaceSharing({
  projectId,
  initialLinks,
}: WorkspaceSharingProps) {
  const [links, setLinks] = useState(() =>
    initialLinks.map(normalizeShareLink),
  );
  const [open, setOpen] = useState(false);
  const [shareType, setShareType] = useState<"ONE_TIME" | "TIME_BASED">(
    "ONE_TIME",
  );
  const [accessType, setAccessType] = useState<"PUBLIC" | "PASSWORD">("PUBLIC");
  const [expiryAt, setExpiryAt] = useState("");
  const [password, setPassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null,
  );

  const activeLinks = useMemo(
    () => links.filter((link) => !link.revokedAt),
    [links],
  );

  async function handleGenerate() {
    setIsCreating(true);
    setMessage(null);

    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          shareType,
          accessType,
          expiryAt: shareType === "TIME_BASED" ? expiryAt : undefined,
          password: accessType === "PASSWORD" ? password : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create share link");
      }

      const newLink: WorkspaceShareLink = {
        id: data.shareLink.id,
        token: data.shareLink.token,
        shareType: data.shareLink.shareType,
        accessType: data.shareLink.accessType,
        expiryAt: data.shareLink.expiryAt ?? null,
        viewCount: 0,
        usedAt: null,
        revokedAt: null,
        createdAt: new Date().toISOString(),
      };

      setLinks((current) => [newLink, ...current]);
      const shareUrl = `${window.location.origin}${data.shareUrl}`;
      setGeneratedUrl(shareUrl);
      setGeneratedPassword(data.password ?? null);
      setMessage("Share link created successfully.");
      setPassword("");
      setExpiryAt("");
      setOpen(false);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to create share link",
      );
    } finally {
      setIsCreating(false);
    }
  }
  async function handleRevoke(token: string) {
    try {
      const response = await fetch(`/api/share/${token}/revoke`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Unable to revoke share link");
      }

      setLinks((current) =>
        current.map((link) =>
          link.token === token
            ? { ...link, revokedAt: new Date().toISOString() }
            : link,
        ),
      );

      setMessage("Share link revoked.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to revoke share link",
      );
    }
  }

  async function handleCopy(url: string) {
    await navigator.clipboard.writeText(url);
    setMessage("Link copied to clipboard.");
  }

  return (
    <div className="rounded-xl border border-border-default bg-bg-surface-raised p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text-primary">
            Share workspace
          </p>
          <p className="mt-1 text-sm text-text-secondary">
            Create public or password-protected links and revoke access when
            needed.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline">
              Share
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create share link</DialogTitle>
              <DialogDescription>
                Choose how the workspace should be shared and when it should
                expire.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label>Share type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={shareType === "ONE_TIME" ? "default" : "outline"}
                    onClick={() => setShareType("ONE_TIME")}
                  >
                    One-time access
                  </Button>
                  <Button
                    type="button"
                    variant={shareType === "TIME_BASED" ? "default" : "outline"}
                    onClick={() => setShareType("TIME_BASED")}
                  >
                    Time-based access
                  </Button>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Access type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={accessType === "PUBLIC" ? "default" : "outline"}
                    onClick={() => setAccessType("PUBLIC")}
                  >
                    Public
                  </Button>
                  <Button
                    type="button"
                    variant={accessType === "PASSWORD" ? "default" : "outline"}
                    onClick={() => setAccessType("PASSWORD")}
                  >
                    Password protected
                  </Button>
                </div>
              </div>

              {shareType === "TIME_BASED" ? (
                <div className="grid gap-2">
                  <Label htmlFor="expiry">Expiry date</Label>
                  <Input
                    id="expiry"
                    type="datetime-local"
                    value={expiryAt}
                    onChange={(event) => setExpiryAt(event.target.value)}
                  />
                </div>
              ) : null}

              {accessType === "PASSWORD" ? (
                <div className="grid gap-2">
                  <Label htmlFor="password">Access key</Label>
                  <Input
                    id="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Leave blank to auto-generate"
                  />
                </div>
              ) : null}
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
                onClick={handleGenerate}
                disabled={isCreating}
              >
                {isCreating ? "Creating…" : "Generate link"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {message ? (
        <p className="mt-3 text-sm text-accent-primary">{message}</p>
      ) : null}

      {generatedUrl ? (
        <div className="mt-4 rounded-lg border border-border-default bg-bg-surface p-3 text-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium text-text-primary">
                Generated share URL
              </p>
              <p className="mt-1 truncate font-mono text-xs text-text-secondary">
                {generatedUrl}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleCopy(generatedUrl)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
          </div>
          {generatedPassword ? (
            <div className="mt-3 flex items-center gap-2 rounded-md border border-accent-primary/20 bg-accent-primary/10 px-3 py-2 text-sm text-accent-primary">
              <KeyRound className="h-4 w-4" />
              <span>Access key: {generatedPassword}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {activeLinks.length === 0 ? (
          <p className="text-sm text-text-secondary">
            No active share links yet.
          </p>
        ) : (
          activeLinks.map((link) => {
            const shareUrl = `share/${link.token}`;
            const status = link.revokedAt
              ? "Revoked"
              : link.usedAt
                ? "Used"
                : link.expiryAt && new Date(link.expiryAt) < new Date()
                  ? "Expired"
                  : "Active";

            const statusColor =
              status === "Active"
                ? "text-green-500"
                : status === "Used"
                  ? "text-red-500"
                  : status === "Expired"
                    ? "text-yellow-500"
                    : "text-gray-500";
            return (
              <div
                key={link.id}
                className="rounded-lg border border-border-default bg-bg-surface p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-accent-primary" />
                      <span className="font-medium text-text-primary">
                        {shareUrl}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-secondary">
                      <span className="rounded-full border border-border-default px-2 py-1">
                        {link.accessType}
                      </span>
                      <span className="rounded-full border border-border-default px-2 py-1">
                        {link.shareType}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-1 font-medium ${
                          status === "Active"
                            ? "border-green-500 text-green-500"
                            : status === "Used"
                              ? "border-red-500 text-red-500"
                              : status === "Expired"
                                ? "border-yellow-500 text-yellow-500"
                                : "border-gray-500 text-gray-500"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevoke(link.token)}
                  >
                    Revoke
                  </Button>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                  <span className="inline-flex items-center gap-1">
                    <TimerReset className="h-3.5 w-3.5" />

                    {link.expiryAt &&
                    !Number.isNaN(new Date(link.expiryAt).getTime())
                      ? new Date(link.expiryAt).toLocaleString()
                      : "No expiry"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <ShieldOff className="h-3.5 w-3.5" />
                    {link.viewCount} views
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
