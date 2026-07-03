"use client";

import { useEffect, useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SharedWorkspacePage() {
  const params = useParams<{ token: string }>();
  const [status, setStatus] = useState<
    "loading" | "ready" | "password_required" | "wrong_password" | "locked" | "unavailable"
  >("loading");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadShare = async () => {
      const response = await fetch(`/api/share/${params.token}`);
      const data = await response.json();

      if (response.ok && data.project) {
        setProjectName(data.project.name);
        setDescription(
          data.project.description ?? "This workspace was shared with you.",
        );
        setContent(data.project.content ?? "");
        setStatus("ready");
        return;
      }

      if (data.requiresPassword) {
        setStatus("password_required");
        return;
      }

      if (response.status === 429) {
        setStatus("locked");
        setMessage(data.error || "Too many attempts. Try again later.");
        return;
      }

      setStatus("unavailable");
      setMessage(data.error || "This share link is no longer available.");
    };

    void loadShare();
  }, [params.token]);

  const unlockShare = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage("");

    const response = await fetch(`/api/share/${params.token}/unlock`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (response.ok && data.project) {
      setProjectName(data.project.name);
      setDescription(
        data.project.description ?? "This workspace was shared with you.",
      );
      setContent(data.project.content ?? "");
      setStatus("ready");
      return;
    }

    if (response.status === 429) {
      setStatus("locked");
      setMessage(data.error || "Too many attempts. Try again later.");
      return;
    }

    setStatus("wrong_password");
    setMessage(data.error || "The access key was incorrect.");
  };

  return (
    <main className="min-h-screen bg-bg-base px-6 py-16 text-text-primary">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 rounded-2xl border border-border-default bg-bg-surface p-8 shadow-sm">
        {status === "loading" ? (
          <div className="space-y-2">
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent-primary">
              Shared workspace
            </p>
            <h1 className="text-3xl font-semibold">Checking access…</h1>
          </div>
        ) : null}

        {status === "ready" ? (
          <>
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-accent-primary">
                Shared workspace
              </p>
              <h1 className="text-3xl font-semibold">{projectName}</h1>
              <p className="text-sm leading-7 text-text-secondary">
                {description}
              </p>
            </div>
            <div className="rounded-xl border border-border-default bg-bg-surface-raised p-4 text-sm leading-7 text-text-primary whitespace-pre-wrap">
              {content || "No content available for this workspace."}
            </div>
          </>
        ) : null}

        {status === "locked" ? (
          <div className="rounded-xl border border-border-default bg-bg-surface-raised p-4 text-sm text-text-secondary">
            <div className="flex items-center gap-2 text-accent-primary">
              <Lock className="h-4 w-4" />
              <p className="text-sm font-semibold">Access locked</p>
            </div>
            <p className="mt-2">{message}</p>
          </div>
        ) : null}

        {status === "password_required" || status === "wrong_password" ? (
          <form className="space-y-4" onSubmit={unlockShare}>
            <div className="rounded-xl border border-border-default bg-bg-surface-raised p-4">
              <div className="flex items-center gap-2 text-accent-primary">
                <Lock className="h-4 w-4" />
                <p className="text-sm font-semibold">
                  This link is password protected
                </p>
              </div>
              <p className="mt-2 text-sm text-text-secondary">
                Enter the access key to view the workspace.
              </p>
              <Input
                className="mt-3"
                placeholder="Access key"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {message ? (
                <p className="mt-2 text-sm text-accent-primary">{message}</p>
              ) : null}
              <Button type="submit" className="mt-4">
                <Unlock className="mr-2 h-4 w-4" />
                Unlock workspace
              </Button>
            </div>
          </form>
        ) : null}

        {status === "unavailable" ? (
          <div className="rounded-xl border border-border-default bg-bg-surface-raised p-4 text-sm text-text-secondary">
            <p className="font-medium text-text-primary">
              Share link unavailable
            </p>
            <p className="mt-2">{message}</p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
