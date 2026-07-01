import { PrismaClient } from '../app/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

declare global {
  // allow caching on global for dev hot-reload
  var __prisma: PrismaClient | undefined
}

if (!process.env.DATABASE_URL) {
  throw new Error('Missing required env var DATABASE_URL')
}

const url = process.env.DATABASE_URL

// Simple branch: if DATABASE_URL starts with prisma+postgres:// assume
// Prisma Accelerate; otherwise default to the normal adapter-based client.
// Both expose the same `PrismaClient` API for our usage here, so we keep
// runtime conditional logic minimal and avoid throwing if adapter libs
// are not present during static analysis.

const createClient = () => {
  if (url.startsWith('prisma+postgres://')) {
    // Prisma Accelerate endpoint
    return new PrismaClient({ accelerateUrl: url })
  }

  // Direct Postgres adapter (adapter package is installed in the project)
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) })
}

const prisma = (global.__prisma ??= createClient())

export default prisma
