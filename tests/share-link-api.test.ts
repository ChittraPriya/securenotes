import { describe, it, expect, vi, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'

// Mock all external deps before importing routes
vi.mock('@/lib/prisma', () => {
  const mockPrisma = {
    shareLink: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    project: {
      findFirst: vi.fn(),
    },
    $transaction: vi.fn(),
  }
  return { default: mockPrisma }
})

vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(),
}))

import prisma from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { checkRateLimit } from '@/lib/rate-limit'

// Helper to build a minimal share link shape returned by Prisma
function makeLink(overrides: Record<string, unknown> = {}) {
  return {
    id: 'link-1',
    token: 'test-token-xxx',
    projectId: 'project-1',
    shareType: 'ONE_TIME',
    accessType: 'PUBLIC',
    passwordHash: null,
    expiryAt: null,
    viewCount: 0,
    usedAt: null,
    revokedAt: null,
    failedAttempts: 0,
    lockedUntil: null,
    createdAt: new Date('2025-01-01'),
    ...overrides,
  }
}

function makeProject(overrides: Record<string, unknown> = {}) {
  return {
    id: 'project-1',
    name: 'Test Project',
    description: 'A test project',
    content: 'Some content',
    ownerId: 'user-1',
    ...overrides,
  }
}

describe('POST /api/share (create)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue({ userId: 'user-1', sessionId: 'sess-1', getToken: vi.fn() } as any)
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true, remaining: 29, resetIn: 60000 })
  })

  it('creates a share link successfully', async () => {
    const project = makeProject()
    vi.mocked(prisma.project.findFirst).mockResolvedValue(project as any)
    const link = makeLink({ token: 'new-token-abc' })
    vi.mocked(prisma.shareLink.create).mockResolvedValue(link as any)

    // Dynamic import so mocks are in place
    const { POST } = await import('@/app/api/share/route')

    const request = new Request('http://localhost:3000/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: 'project-1',
        shareType: 'ONE_TIME',
        accessType: 'PUBLIC',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body).toHaveProperty('shareUrl')
    expect(body).toHaveProperty('password')
    expect(body.shareLink.token).toBe('new-token-abc')
  })

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null, sessionId: null, getToken: vi.fn() } as any)
    const { POST } = await import('@/app/api/share/route')

    const request = new Request('http://localhost:3000/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId: 'project-1' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('returns 404 when project not owned by user', async () => {
    vi.mocked(prisma.project.findFirst).mockResolvedValue(null)
    const { POST } = await import('@/app/api/share/route')

    const request = new Request('http://localhost:3000/api/share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: 'project-nonexistent',
        shareType: 'ONE_TIME',
        accessType: 'PUBLIC',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(404)
  })
})

describe('GET /api/share/[token] (status)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true, remaining: 29, resetIn: 60000 })
  })

  it('returns ok for a valid active link', async () => {
    const link = makeLink({ shareType: 'TIME_BASED', accessType: 'PUBLIC', project: makeProject() })
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(link as any)

    const { GET } = await import('@/app/api/share/[token]/route')

    const request = new Request('http://localhost:3000/api/share/test-token-xxx')
    const response = await GET(request, { params: Promise.resolve({ token: 'test-token-xxx' }) })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('project')
  })

  it('returns 404 for a missing token', async () => {
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(null)
    const { GET } = await import('@/app/api/share/[token]/route')

    const request = new Request('http://localhost:3000/api/share/nonexistent')
    const response = await GET(request, { params: Promise.resolve({ token: 'nonexistent' }) })
    expect(response.status).toBe(404)
  })

  it('returns 403 for a revoked link', async () => {
    const link = makeLink({ revokedAt: new Date('2025-06-01') })
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(link as any)
    const { GET } = await import('@/app/api/share/[token]/route')

    const request = new Request('http://localhost:3000/api/share/test-token-xxx')
    const response = await GET(request, { params: Promise.resolve({ token: 'test-token-xxx' }) })
    expect(response.status).toBe(403)
  })

  it('returns 410 for an expired link', async () => {
    const link = makeLink({ shareType: 'TIME_BASED', expiryAt: new Date('2020-01-01') })
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(link as any)
    const { GET } = await import('@/app/api/share/[token]/route')

    const request = new Request('http://localhost:3000/api/share/test-token-xxx')
    const response = await GET(request, { params: Promise.resolve({ token: 'test-token-xxx' }) })
    expect(response.status).toBe(410)
  })

  it('returns password_required for a password-protected link', async () => {
    const link = makeLink({
      accessType: 'PASSWORD',
      passwordHash: await bcrypt.hash('TEST-KEY', 10),
    })
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(link as any)
    const { GET } = await import('@/app/api/share/[token]/route')

    const request = new Request('http://localhost:3000/api/share/test-token-xxx')
    const response = await GET(request, { params: Promise.resolve({ token: 'test-token-xxx' }) })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.requiresPassword).toBe(true)
  })
})

describe('POST /api/share/[token]/unlock (consume)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: true, remaining: 29, resetIn: 60000 })
  })

  function makeUnlockTx(link: ReturnType<typeof makeLink>) {
    let viewCount = link.viewCount ?? 0
    let usedAt = link.usedAt ?? null
    const project = link.project || makeProject()
    return {
      shareLink: {
        findUnique: vi.fn(async () => ({
          ...link,
          viewCount,
          usedAt,
          project,
        })),
        update: vi.fn(),
        updateMany: vi.fn(async () => {
          viewCount++
          if (link.shareType === 'ONE_TIME') {
            usedAt = new Date()
          }
          return { count: 1 }
        }),
      },
    }
  }

  it('consumes a public one-time link successfully', async () => {
    const link = makeLink({ shareType: 'ONE_TIME', accessType: 'PUBLIC', project: makeProject() })
    const tx = makeUnlockTx(link)
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(tx))

    const { POST } = await import('@/app/api/share/[token]/unlock/route')
    const request = new Request('http://localhost:3000/api/share/test-token-xxx/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'irrelevant-for-public' }),
    })

    const response = await POST(request, { params: Promise.resolve({ token: 'test-token-xxx' }) })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('project')
    expect(body.shareLink.shareType).toBe('ONE_TIME')
  })

  it('returns 400 if password is missing', async () => {
    const { POST } = await import('@/app/api/share/[token]/unlock/route')
    const request = new Request('http://localhost:3000/api/share/test-token-xxx/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })

    const response = await POST(request, { params: Promise.resolve({ token: 'test-token-xxx' }) })
    expect(response.status).toBe(400)
  })

  it('returns 429 when rate limited', async () => {
    vi.mocked(checkRateLimit).mockReturnValue({ allowed: false, remaining: 0, resetIn: 30000 })
    const { POST } = await import('@/app/api/share/[token]/unlock/route')
    const request = new Request('http://localhost:3000/api/share/test-token-xxx/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'TEST-KEY' }),
    })

    const response = await POST(request, { params: Promise.resolve({ token: 'test-token-xxx' }) })
    expect(response.status).toBe(429)
  })
})

describe('PATCH /api/share/[token]/revoke', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(auth).mockResolvedValue({ userId: 'user-1', sessionId: 'sess-1', getToken: vi.fn() } as any)
  })

  it('revokes a link owned by the user', async () => {
    const link = makeLink({ project: makeProject(), revokedAt: null })
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(link as any)
    vi.mocked(prisma.shareLink.update).mockResolvedValue({} as any)

    const { PATCH } = await import('@/app/api/share/[token]/revoke/route')
    const request = new Request('http://localhost:3000/api/share/test-token-xxx/revoke', {
      method: 'PATCH',
    })

    const response = await PATCH(request, { params: Promise.resolve({ token: 'test-token-xxx' }) })
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.success).toBe(true)
  })

  it('returns 401 when unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValue({ userId: null, sessionId: null, getToken: vi.fn() } as any)
    const { PATCH } = await import('@/app/api/share/[token]/revoke/route')
    const request = new Request('http://localhost:3000/api/share/test-token-xxx/revoke', {
      method: 'PATCH',
    })

    const response = await PATCH(request, { params: Promise.resolve({ token: 'test-token-xxx' }) })
    expect(response.status).toBe(401)
  })

  it('returns 404 for nonexistent link', async () => {
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(null)
    const { PATCH } = await import('@/app/api/share/[token]/revoke/route')
    const request = new Request('http://localhost:3000/api/share/test-token-xxx/revoke', {
      method: 'PATCH',
    })

    const response = await PATCH(request, { params: Promise.resolve({ token: 'test-token-xxx' }) })
    expect(response.status).toBe(404)
  })
})
