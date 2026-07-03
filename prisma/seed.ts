import { PrismaClient } from "./../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  const ownerId = process.env.SEED_USER_ID;

  if (!ownerId) {
    console.error(
      "SEED_USER_ID is not set. Set it to the Clerk user ID of the demo account."
    );
    process.exit(1);
  }

  // Check if seed data already exists
  const existing = await prisma.project.findFirst({
    where: { ownerId },
    select: { id: true },
  });

  if (existing) {
    console.log("Seed data already exists for this user. Skipping.");
    return;
  }

  // Create demo projects
  const project1 = await prisma.project.create({
    data: {
      ownerId,
      name: "Getting Started Guide",
      description: "A quick overview of SecureNotes",
      content: [
        "# Welcome to SecureNotes",
        "",
        "This is a **secure note-sharing app** with expiring, access-controlled share links.",
        "",
        "## Key Features",
        "",
        "- **One-time links** — share a note that self-destructs after the first view",
        "- **Time-based links** — set an expiry date and time",
        "- **Password protection** — require a key to view",
        "- **Collaborators** — invite people by email for persistent access",
        "- **Revocation** — kill any active link instantly",
        "",
        "Try creating a share link from this workspace using the sharing panel below.",
      ].join("\n"),
    },
  });

  const project2 = await prisma.project.create({
    data: {
      ownerId,
      name: "Architecture Notes",
      description: "System design and architecture decisions",
      content: [
        "# Architecture",
        "",
        "## Stack",
        "",
        "- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS",
        "- **API**: Next.js Route Handlers",
        "- **Database**: PostgreSQL via Prisma ORM",
        "- **Auth**: Clerk (authentication) + httpOnly session cookies",
        "",
        "## Security Invariants",
        "",
        "1. No fallback secrets — missing env vars throw at boot",
        "2. Atomic share-link state changes — no read-then-write race conditions",
        "3. View counts only increment as a side effect of successful atomic consume",
        "4. All external input is validated at the API boundary with Zod",
        "5. Ownership checks before any mutation",
      ].join("\n"),
    },
  });

  const project3 = await prisma.project.create({
    data: {
      ownerId,
      name: "Meeting Notes — Q3 Planning",
      description: "Notes from the Q3 planning session",
      content: [
        "# Q3 Planning Session",
        "",
        "## Attendees",
        "- Alice (Engineering)",
        "- Bob (Product)",
        "- Carol (Design)",
        "",
        "## Action Items",
        "",
        "- Finalize the share link API by end of July",
        "- Add collaborator management in August",
        "- Q3 launch目标是 September 15th",
        "",
        "## Decisions",
        "",
        "We'll use atomic `updateMany` with WHERE conditions instead of read-then-write for all share link operations. This eliminates race conditions without distributed locks.",
      ].join("\n"),
    },
  });

  // Create share links for the first project
  await prisma.shareLink.create({
    data: {
      projectId: project1.id,
      token: "demo-one-time-0001",
      shareType: "ONE_TIME",
      accessType: "PUBLIC",
    },
  });

  await prisma.shareLink.create({
    data: {
      projectId: project1.id,
      token: "demo-time-based-0001",
      shareType: "TIME_BASED",
      accessType: "PUBLIC",
      expiryAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  await prisma.shareLink.create({
    data: {
      projectId: project1.id,
      token: "demo-password-0001",
      shareType: "ONE_TIME",
      accessType: "PASSWORD",
      passwordHash:
        "$2a$10$dummyhashfordemopasswordkey00000000000000000000000",
    },
  });

  // Add a collaborator to project 2
  await prisma.projectCollaborator.create({
    data: {
      projectId: project2.id,
      collaboratorEmail: "collaborator@example.com",
    },
  });

  console.log("Seed data created successfully.");
  console.log(`  - ${3} projects owned by ${ownerId}`);
  console.log(`  - ${3} share links on "Getting Started Guide"`);
  console.log(
    `  - 1 collaborator (collaborator@example.com) on "Architecture Notes"`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
