import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var __prisma: PrismaClient | undefined;
}

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL");
}

const prisma =
  global.__prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    }),
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

export default prisma;