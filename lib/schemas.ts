import { z } from "zod";

/**
 * POST /api/notes — Create a note.
 * All fields are optional — invalid/missing fields fall back to safe defaults.
 */
export const createNoteSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1)
      .catch("Untitled Project")
      .default("Untitled Project"),
    description: z.string().nullable().catch(null).default(null),
    content: z.string().nullable().catch(null).default(null),
  })
  .catch({ name: "Untitled Project", description: null, content: null });

export type CreateNoteInput = z.infer<typeof createNoteSchema>;

/**
 * PATCH /api/notes/[notesId] — Update a note.
 * Every field is optional; only provided fields are applied.
 */
export const updateNoteSchema = z.object({
  name: z.string().trim().min(1).optional(),
  content: z.string().optional(),
});

export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

/**
 * POST /api/share — Create a share link.
 * shareType defaults to TIME_BASED, accessType defaults to PUBLIC.
 * expiryAt is required and must be a future date for TIME_BASED links.
 */
export const createShareSchema = z
  .object({
    projectId: z.string().min(1, "projectId is required"),
    shareType: z
      .enum(["ONE_TIME", "TIME_BASED"])
      .catch("TIME_BASED")
      .default("TIME_BASED"),
    accessType: z
      .enum(["PASSWORD", "PUBLIC"])
      .catch("PUBLIC")
      .default("PUBLIC"),
    expiryAt: z.string().optional(),
    password: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.shareType !== "TIME_BASED") return true;
      return typeof data.expiryAt === "string" && data.expiryAt.trim() !== "";
    },
    { message: "expiryAt is required for time-based links", path: ["expiryAt"] },
  )
  .refine(
    (data) => {
      if (!data.expiryAt) return true;
      const parsed = new Date(data.expiryAt);
      if (Number.isNaN(parsed.getTime())) return false;
      if (parsed <= new Date()) return false;
      return true;
    },
    { message: "expiryAt must be a valid future date", path: ["expiryAt"] },
  );

export type CreateShareInput = z.infer<typeof createShareSchema>;

/**
 * POST /api/share/[token]/unlock — Unlock a share link with password.
 */
export const unlockSchema = z.object({
  password: z.string().min(1, "password is required"),
});

export type UnlockInput = z.infer<typeof unlockSchema>;

/**
 * POST /api/notes/[notesId]/collaborators — Add a collaborator.
 */
export const addCollaboratorSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type AddCollaboratorInput = z.infer<typeof addCollaboratorSchema>;

/**
 * DELETE /api/notes/[notesId]/collaborators — Remove a collaborator.
 */
export const removeCollaboratorSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type RemoveCollaboratorInput = z.infer<typeof removeCollaboratorSchema>;
