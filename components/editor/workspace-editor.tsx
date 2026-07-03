"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bot,
  PanelRightClose,
  Send,
  Save,
  Clock,
} from "lucide-react";

import { WorkspaceCollaborators } from "@/components/editor/workspace-collaborators";
import { WorkspaceSharing } from "@/components/editor/workspace-sharing";
import type { WorkspaceCollaborator } from "@/components/editor/workspace-collaborators";
import type { WorkspaceShareLink } from "@/components/editor/workspace-sharing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type WorkspaceEditorProps = {
  projectId: string;
  projectName: string;
  initialContent: string | null;
  createdAt: string;
  updatedAt: string;
  isOwner: boolean;
  initialCollaborators: WorkspaceCollaborator[];
  initialShareLinks: WorkspaceShareLink[];
};

type SaveStatus = "saved" | "saving" | "unsaved" | "error";

export function WorkspaceEditor({
  projectId,
  projectName,
  initialContent,
  createdAt,
  updatedAt,
  isOwner,
  initialCollaborators,
  initialShareLinks,
}: WorkspaceEditorProps) {
  const [content, setContent] = useState(initialContent ?? "");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "I'm your AI assistant. I can help you brainstorm, review content, or answer questions about this workspace.",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Debounced autosave
  const save = useCallback(
    async (text: string) => {
      setSaveStatus("saving");
      try {
        const response = await fetch(`/api/notes/${projectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
        });

        if (!response.ok) {
          throw new Error("Save failed");
        }

        setSaveStatus("saved");
      } catch {
        setSaveStatus("error");
      }
    },
    [projectId],
  );

  function handleContentChange(value: string) {
    setContent(value);
    setSaveStatus("unsaved");

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      save(value);
    }, 1500);
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  async function handleChatSend() {
    const text = chatInput.trim();
    if (!text || chatSending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatSending(true);

    // Simulate AI response — in a real app this would call an API
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        text: `I've noted your question about "${text}". This workspace has an AI assistant ready to help with brainstorming, reviewing content, and answering questions.`,
      };
      setChatMessages((prev) => [...prev, assistantMessage]);
      setChatSending(false);
    }, 800);
  }

  const saveStatusIcon =
    saveStatus === "saving" ? (
      <Save className="h-3.5 w-3.5 animate-pulse text-yellow-400" />
    ) : saveStatus === "error" ? (
      <Save className="h-3.5 w-3.5 text-red-400" />
    ) : (
      <Save className="h-3.5 w-3.5 text-green-400" />
    );

  const saveStatusText =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "error"
        ? "Save failed"
        : saveStatus === "unsaved"
          ? "Unsaved changes"
          : "Saved";

  return (
    <div className="flex min-h-screen flex-col bg-bg-base text-text-primary">
      {/* ── Header ── */}
      <header className="flex h-14 items-center justify-between border-b border-border-default bg-bg-surface px-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.3em] text-text-muted">
            Workspace
          </p>
          <h1 className="truncate text-sm font-semibold">{projectName}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Save status */}
          <span className="mr-2 inline-flex items-center gap-1.5 text-xs text-text-muted">
            {saveStatusIcon}
            {saveStatusText}
          </span>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => setAiSidebarOpen((v) => !v)}
            title={aiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
          >
            <Bot className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Rooms sidebar */}
        <aside className="hidden w-72 shrink-0 border-r border-border-default bg-bg-surface px-4 py-4 lg:block">
          <div className="rounded-xl border border-border-default bg-bg-surface-raised p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
              Rooms
            </p>
            <div className="mt-3 rounded-lg border border-accent-primary/40 bg-accent-primary/10 px-3 py-2 text-sm font-medium text-accent-primary">
              {projectName}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex-1 space-y-6 px-8 py-6">
            {/* Content editor */}
            <div className="rounded-xl border border-border-default bg-bg-surface-raised p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
                Content
              </p>
              <Textarea
                className="min-h-[300px] resize-y text-sm leading-7"
                placeholder="Start writing your note content here…"
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
              />
            </div>

            {/* Workspace sharing — available to all who can access */}
            <WorkspaceSharing
              projectId={projectId}
              initialLinks={initialShareLinks}
            />

            {/* Collaborators — owner only */}
            {isOwner ? (
              <WorkspaceCollaborators
                projectId={projectId}
                initialCollaborators={initialCollaborators}
              />
            ) : null}
          </div>

          {/* Footer metadata */}
          <div className="border-t border-border-default px-8 py-3">
            <p className="inline-flex items-center gap-2 text-xs text-text-muted">
              <Clock className="h-3.5 w-3.5" />
              Created{" "}
              {new Date(createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}{" "}
              &middot; Updated{" "}
              {new Date(updatedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </main>

        {/* AI sidebar */}
        <aside
          className={cn(
            "flex shrink-0 flex-col border-l border-border-default bg-bg-surface transition-all duration-200",
            aiSidebarOpen ? "w-80" : "w-0 overflow-hidden border-l-0",
          )}
        >
          {aiSidebarOpen ? (
            <>
              <div className="flex items-center justify-between border-b border-border-default px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-accent-primary" />
                  <p className="text-sm font-semibold">AI Assistant</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setAiSidebarOpen(false)}
                >
                  <PanelRightClose className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="flex-1 px-4 py-3">
                <div className="space-y-4">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex",
                        msg.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-xl px-3 py-2 text-sm leading-6",
                          msg.role === "user"
                            ? "bg-accent-primary text-white"
                            : "border border-border-default bg-bg-surface-raised text-text-primary",
                        )}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {chatSending ? (
                    <div className="flex justify-start">
                      <div className="max-w-[85%] rounded-xl border border-border-default bg-bg-surface-raised px-3 py-2 text-sm text-text-muted">
                        Thinking…
                      </div>
                    </div>
                  ) : null}
                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              <div className="border-t border-border-default p-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleChatSend();
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask the AI…"
                    disabled={chatSending}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    size="icon-sm"
                    disabled={!chatInput.trim() || chatSending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
