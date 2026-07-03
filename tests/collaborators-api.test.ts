import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => {
  const mockPrisma = {
    project: {
      findUnique: vi.fn(),
    },
    projectCollaborator: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  }
  return { default: mockPrisma }
})

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

import prisma from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

function makeProject(overrides: Record<string, unknown> = {}) {
  return {
    id: 'project-1',
    ownerId: 'user-1',
    ...overrides,
  }
}

function makeCollaborator(overrides: Record<string, unknown> = {}) {
  return {
    id: 'collab-1',
    collaboratorEmail: 'alice@example.com',
    createdAt: new Date('2025-01-01'),
    ...overrides,
  }
}

describe('Collaborators API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue({ userId: 'user-1', sessionId: 'sess-1', getToken: vi.fn() } as any)
  })

  describe('GET /api/notes/[notesId]/collaborators', () => {
    it('lists collaborators for an owned project', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(makeProject() as any)
      vi.mocked(prisma.projectCollaborator.findMany).mockResolvedValue([
        makeCollaborator(),
      ] as any)

      const { GET } = await import('@/app/api/notes/[notesId]/collaborators/route')

      const request = new Request('http://localhost:3000/api/notes/project-1/collaborators')
      const response = await GET(request, { params: Promise.resolve({ notesId: 'project-1' }) })
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.collaborators).toHaveLength(1)
      expect(body.collaborators[0].collaboratorEmail).toBe('alice@example.com')
    })

    it('returns 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null, sessionId: null, getToken: vi.fn() } as any)

      const { GET } = await import('@/app/api/notes/[notesId]/collaborators/route')

      const request = new Request('http://localhost:3000/api/notes/project-1/collaborators')
      const response = await GET(request, { params: Promise.resolve({ notesId: 'project-1' }) })
      expect(response.status).toBe(401)
    })

    it('returns 403 when not the owner', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(makeProject({ ownerId: 'other-user' }) as any)

      const { GET } = await import('@/app/api/notes/[notesId]/collaborators/route')

      const request = new Request('http://localhost:3000/api/notes/project-1/collaborators')
      const response = await GET(request, { params: Promise.resolve({ notesId: 'project-1' }) })
      expect(response.status).toBe(403)
    })

    it('returns 404 when project not found', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(null)

      const { GET } = await import('@/app/api/notes/[notesId]/collaborators/route')

      const request = new Request('http://localhost:3000/api/notes/project-1/collaborators')
      const response = await GET(request, { params: Promise.resolve({ notesId: 'project-1' }) })
      expect(response.status).toBe(404)
    })
  })

  describe('POST /api/notes/[notesId]/collaborators', () => {
    it('adds a collaborator successfully', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(makeProject() as any)
      vi.mocked(prisma.projectCollaborator.create).mockResolvedValue(makeCollaborator() as any)

      const { POST } = await import('@/app/api/notes/[notesId]/collaborators/route')

      const request = new Request('http://localhost:3000/api/notes/project-1/collaborators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'alice@example.com' }),
      })

      const response = await POST(request, { params: Promise.resolve({ notesId: 'project-1' }) })
      expect(response.status).toBe(201)
      const body = await response.json()
      expect(body.collaborator.collaboratorEmail).toBe('alice@example.com')
    })

    it('returns 401 when unauthenticated', async () => {
      vi.mocked(auth).mockResolvedValue({ userId: null, sessionId: null, getToken: vi.fn() } as any)

      const { POST } = await import('@/app/api/notes/[notesId]/collaborators/route')

      const request = new Request('http://localhost:3000/api/notes/project-1/collaborators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'alice@example.com' }),
      })

      const response = await POST(request, { params: Promise.resolve({ notesId: 'project-1' }) })
      expect(response.status).toBe(401)
    })

    it('returns 400 for invalid email', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(makeProject() as any)

      const { POST } = await import('@/app/api/notes/[notesId]/collaborators/route')

      const request = new Request('http://localhost:3000/api/notes/project-1/collaborators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'not-an-email' }),
      })

      const response = await POST(request, { params: Promise.resolve({ notesId: 'project-1' }) })
      expect(response.status).toBe(400)
    })

    it('returns 409 for duplicate collaborator', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(makeProject() as any)
      const p2002 = new Error('Unique constraint')
      ;(p2002 as any).code = 'P2002'
      vi.mocked(prisma.projectCollaborator.create).mockRejectedValue(p2002)

      const { POST } = await import('@/app/api/notes/[notesId]/collaborators/route')

      const request = new Request('http://localhost:3000/api/notes/project-1/collaborators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'alice@example.com' }),
      })

      const response = await POST(request, { params: Promise.resolve({ notesId: 'project-1' }) })
      expect(response.status).toBe(409)
    })

    it('returns 403 when not the owner', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(makeProject({ ownerId: 'other-user' }) as any)

      const { POST } = await import('@/app/api/notes/[notesId]/collaborators/route')

      const request = new Request('http://localhost:3000/api/notes/project-1/collaborators', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'alice@example.com' }),
      })

      const response = await POST(request, { params: Promise.resolve({ notesId: 'project-1' }) })
      expect(response.status).toBe(403)
    })
  })

  describe('DELETE /api/notes/[notesId]/collaborators', () => {
    it('removes a collaborator successfully', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(makeProject() as any)
      vi.mocked(prisma.projectCollaborator.deleteMany).mockResolvedValue({ count: 1 })

      const { DELETE } = await import('@/app/api/notes/[notesId]/collaborators/route')

      const request = new Request('http://localhost:3000/api/notes/project-1/collaborators', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'alice@example.com' }),
      })

      const response = await DELETE(request, { params: Promise.resolve({ notesId: 'project-1' }) })
      expect(response.status).toBe(200)
      const body = await response.json()
      expect(body.success).toBe(true)
    })

    it('returns 404 when collaborator not found', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(makeProject() as any)
      vi.mocked(prisma.projectCollaborator.deleteMany).mockResolvedValue({ count: 0 })

      const { DELETE } = await import('@/app/api/notes/[notesId]/collaborators/route')

      const request = new Request('http://localhost:3000/api/notes/project-1/collaborators', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nonexistent@example.com' }),
      })

      const response = await DELETE(request, { params: Promise.resolve({ notesId: 'project-1' }) })
      expect(response.status).toBe(404)
    })

    it('returns 403 when not the owner', async () => {
      vi.mocked(prisma.project.findUnique).mockResolvedValue(makeProject({ ownerId: 'other-user' }) as any)

      const { DELETE } = await import('@/app/api/notes/[notesId]/collaborators/route')

      const request = new Request('http://localhost:3000/api/notes/project-1/collaborators', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'alice@example.com' }),
      })

      const response = await DELETE(request, { params: Promise.resolve({ notesId: 'project-1' }) })
      expect(response.status).toBe(403)
    })
  })
})
