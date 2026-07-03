import { describe, it, expect, vi, beforeEach } from 'vitest'
import bcrypt from 'bcryptjs'

// Mock prisma before importing the module under test
vi.mock('@/lib/prisma', () => {
  // We'll dynamically build the mock so tests can mutate the store
  const mockPrisma = {
    shareLink: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(),
  }
  return { default: mockPrisma }
})

import prisma from '@/lib/prisma'
import * as shareLinkModule from '@/lib/share-link'

// Helper to create a settled share link (one that exists with defaults)
function makeSettledLink(overrides: Record<string, unknown> = {}) {
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
    project: {
      id: 'project-1',
      name: 'Test Project',
      description: 'A test project',
      content: 'Some content',
      ownerId: 'user-1',
    },
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

// Helper to build mock tx for consumeShareLink
function makeMockTx(link: ReturnType<typeof makeSettledLink>) {
  let currentLink = { ...link }
  return {
    shareLink: {
      findUnique: vi.fn(async () => {
        const p = currentLink.project
        const { project, ...scalars } = currentLink
        return { ...scalars, project: p }
      }),
      update: vi.fn(async (args: { where: { id: string }; data: Record<string, unknown> }) => {
        for (const [key, value] of Object.entries(args.data)) {
          if (value && typeof value === 'object' && 'set' in value) {
            ;(currentLink as Record<string, unknown>)[key] = (value as { set: unknown }).set
          } else {
            ;(currentLink as Record<string, unknown>)[key] = value
          }
        }
        return currentLink
      }),
      updateMany: vi.fn(async () => {
        // Simulate atomic consume: mark usedAt if ONE_TIME
        if (currentLink.shareType === 'ONE_TIME' && !currentLink.usedAt) {
          currentLink.usedAt = new Date()
        }
        currentLink.viewCount++
        return { count: 1 }
      }),
    },
  }
}

describe('createShareLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a one-time public share link', async () => {
    const mockCreated = makeSettledLink({
      token: 'abc123',
      shareType: 'ONE_TIME',
      accessType: 'PUBLIC',
    })

    vi.mocked(prisma.shareLink.create).mockResolvedValue(mockCreated as any)

    const result = await shareLinkModule.createShareLink({
      projectId: 'project-1',
      shareType: 'ONE_TIME',
      accessType: 'PUBLIC',
    })

    expect(result).toHaveProperty('shareUrl')
    expect(result).toHaveProperty('token', 'abc123')
    expect(result.password).toBeNull()
    expect(prisma.shareLink.create).toHaveBeenCalledTimes(1)
  })

  it('creates a password-protected share link and returns the key', async () => {
    const mockCreated = makeSettledLink({
      token: 'abc456',
      shareType: 'TIME_BASED',
      accessType: 'PASSWORD',
      passwordHash: await bcrypt.hash('ABCD-1234', 10),
    })

    vi.mocked(prisma.shareLink.create).mockResolvedValue(mockCreated as any)

    const result = await shareLinkModule.createShareLink({
      projectId: 'project-1',
      shareType: 'TIME_BASED',
      accessType: 'PASSWORD',
      password: 'ABCD-1234',
    })

    expect(result.token).toBe('abc456')
    expect(result.password).toBe('ABCD-1234')
  })

  it('normalizes null expiryAt to null', async () => {
    const mockCreated = makeSettledLink({
      token: 'abc789',
      shareType: 'TIME_BASED',
      expiryAt: null,
    })

    vi.mocked(prisma.shareLink.create).mockResolvedValue(mockCreated as any)

    const result = await shareLinkModule.createShareLink({
      projectId: 'project-1',
      shareType: 'TIME_BASED',
      accessType: 'PUBLIC',
      expiryAt: null,
    })

    expect(result.shareLink.expiryAt).toBeNull()
  })
})

describe('getShareLinkStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns ok for a valid active link', async () => {
    const link = makeSettledLink({ shareType: 'TIME_BASED', accessType: 'PUBLIC' })
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(link as any)

    const result = await shareLinkModule.getShareLinkStatus('test-token-xxx')
    expect(result.kind).toBe('ok')
    if (result.kind === 'ok') {
      expect(result.project?.name).toBe('Test Project')
    }
  })

  it('returns not_found for a missing token', async () => {
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(null)

    const result = await shareLinkModule.getShareLinkStatus('nonexistent')
    expect(result.kind).toBe('not_found')
  })

  it('returns revoked for a revoked link', async () => {
    const link = makeSettledLink({ revokedAt: new Date('2025-06-01') })
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(link as any)

    const result = await shareLinkModule.getShareLinkStatus('test-token-xxx')
    expect(result.kind).toBe('revoked')
  })

  it('returns used for a one-time link that has been used', async () => {
    const link = makeSettledLink({
      shareType: 'ONE_TIME',
      usedAt: new Date('2025-06-01'),
    })
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(link as any)

    const result = await shareLinkModule.getShareLinkStatus('test-token-xxx')
    expect(result.kind).toBe('used')
  })

  it('returns expired for an expired time-based link', async () => {
    const link = makeSettledLink({
      shareType: 'TIME_BASED',
      expiryAt: new Date('2020-01-01'), // definitely in the past
    })
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(link as any)

    const result = await shareLinkModule.getShareLinkStatus('test-token-xxx')
    expect(result.kind).toBe('expired')
  })

  it('returns password_required for a password-protected link', async () => {
    const link = makeSettledLink({
      accessType: 'PASSWORD',
      passwordHash: await bcrypt.hash('TEST-KEY', 10),
    })
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(link as any)

    const result = await shareLinkModule.getShareLinkStatus('test-token-xxx')
    expect(result.kind).toBe('password_required')
  })

  it('returns locked when the link is locked', async () => {
    const link = makeSettledLink({
      accessType: 'PASSWORD',
      passwordHash: await bcrypt.hash('TEST-KEY', 10),
      lockedUntil: new Date(Date.now() + 60_000), // locked for another minute
    })
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(link as any)

    const result = await shareLinkModule.getShareLinkStatus('test-token-xxx')
    expect(result.kind).toBe('locked')
  })
})

describe('consumeShareLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('consumes a valid public one-time link', async () => {
    const link = makeSettledLink({
      shareType: 'ONE_TIME',
      accessType: 'PUBLIC',
    })
    const tx = makeMockTx(link)
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(tx))

    const result = await shareLinkModule.consumeShareLink('test-token-xxx')

    expect(result.kind).toBe('ok')
    if (result.kind === 'ok') {
      expect(result.project.name).toBe('Test Project')
    }
  })

  it('consumes a valid time-based link without marking used', async () => {
    const link = makeSettledLink({
      shareType: 'TIME_BASED',
      accessType: 'PUBLIC',
      expiryAt: new Date(Date.now() + 86_400_000), // tomorrow
    })
    const tx = makeMockTx(link)
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(tx))

    const result = await shareLinkModule.consumeShareLink('test-token-xxx')

    expect(result.kind).toBe('ok')
    if (result.kind === 'ok') {
      // View count should be incremented: 0 + 1
      expect(result.shareLink.viewCount).toBe(1)
    }
  })

  it('returns not_found for a missing token', async () => {
    const tx = makeMockTx(makeSettledLink())
    tx.shareLink.findUnique = vi.fn().mockResolvedValue(null)
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(tx))

    const result = await shareLinkModule.consumeShareLink('nonexistent')
    expect(result.kind).toBe('not_found')
  })

  it('returns revoked for a revoked link', async () => {
    const link = makeSettledLink({ revokedAt: new Date('2025-06-01') })
    const tx = makeMockTx(link)
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(tx))

    const result = await shareLinkModule.consumeShareLink('test-token-xxx')
    expect(result.kind).toBe('revoked')
  })

  it('returns used for a one-time link already consumed', async () => {
    const link = makeSettledLink({
      shareType: 'ONE_TIME',
      usedAt: new Date('2025-06-01'),
    })
    const tx = makeMockTx(link)
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(tx))

    const result = await shareLinkModule.consumeShareLink('test-token-xxx')
    expect(result.kind).toBe('used')
  })

  it('returns expired for an expired link', async () => {
    const link = makeSettledLink({
      shareType: 'TIME_BASED',
      expiryAt: new Date('2020-01-01'),
    })
    const tx = makeMockTx(link)
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(tx))

    const result = await shareLinkModule.consumeShareLink('test-token-xxx')
    expect(result.kind).toBe('expired')
  })

  it('returns password_required when no password is provided', async () => {
    const link = makeSettledLink({
      accessType: 'PASSWORD',
      passwordHash: await bcrypt.hash('TEST-KEY', 10),
    })
    const tx = makeMockTx(link)
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(tx))

    const result = await shareLinkModule.consumeShareLink('test-token-xxx')
    expect(result.kind).toBe('password_required')
  })

  it('consumes a password-protected link with the correct password', async () => {
    const plainPassword = 'TEST-KEY'
    const hashedPassword = await bcrypt.hash(plainPassword, 10)
    const link = makeSettledLink({
      accessType: 'PASSWORD',
      passwordHash: hashedPassword,
    })
    const tx = makeMockTx(link)
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(tx))

    const result = await shareLinkModule.consumeShareLink('test-token-xxx', {
      password: plainPassword,
    })

    expect(result.kind).toBe('ok')
  })

  it('returns invalid_password for a wrong password', async () => {
    const link = makeSettledLink({
      accessType: 'PASSWORD',
      passwordHash: await bcrypt.hash('REAL-KEY', 10),
    })
    const tx = makeMockTx(link)
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(tx))

    const result = await shareLinkModule.consumeShareLink('test-token-xxx', {
      password: 'WRONG-KEY',
    })

    expect(result.kind).toBe('invalid_password')
  })

  it('returns locked when locked out', async () => {
    const link = makeSettledLink({
      accessType: 'PASSWORD',
      passwordHash: await bcrypt.hash('TEST-KEY', 10),
      lockedUntil: new Date(Date.now() + 60_000),
    })
    const tx = makeMockTx(link)
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(tx))

    const result = await shareLinkModule.consumeShareLink('test-token-xxx', {
      password: 'ANY-KEY',
    })

    expect(result.kind).toBe('locked')
  })

  it('locks after 5 consecutive wrong password attempts', async () => {
    // link starts with 0 failed attempts, no lock
    const link = makeSettledLink({
      accessType: 'PASSWORD',
      passwordHash: await bcrypt.hash('CORRECT-KEY', 10),
      failedAttempts: 4, // one more wrong attempt should trigger lock
    })
    const tx = makeMockTx(link)
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(tx))

    const result = await shareLinkModule.consumeShareLink('test-token-xxx', {
      password: 'WRONG-KEY',
    })

    expect(result.kind).toBe('invalid_password')
    // Should have set lockedUntil
    expect(tx.shareLink.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          lockedUntil: expect.any(Date),
        }),
      })
    )
  })

  it('handles concurrent consumes on a one-time link atomically (only one succeeds)', async () => {
    // Use shared mutable state so both transactions see the same data
    const sharedLink = makeSettledLink({
      shareType: 'ONE_TIME',
      accessType: 'PUBLIC',
    })
    let used = false
    let consumptionCount = 0

    // Build a $transaction that simulates atomic updateMany behavior
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => {
      // Simulate the findUnique
      const p = sharedLink.project
      const { project, ...scalars } = sharedLink
      const findResult = used ? { ...scalars, usedAt: new Date(), project: p } : { ...scalars, usedAt: null, project: p }

      const mockTx = {
        shareLink: {
          findUnique: vi.fn().mockResolvedValue(findResult),
          update: vi.fn(),
          updateMany: vi.fn(async () => {
            if (!used) {
              used = true
              consumptionCount++
              sharedLink.usedAt = new Date()
              sharedLink.viewCount++
              return { count: 1 }
            }
            return { count: 0 }
          }),
        },
      }

      return cb(mockTx)
    })

    const results = await Promise.all([
      shareLinkModule.consumeShareLink('test-token-xxx'),
      shareLinkModule.consumeShareLink('test-token-xxx'),
      shareLinkModule.consumeShareLink('test-token-xxx'),
    ])

    const okResults = results.filter(r => r.kind === 'ok')
    const invalidResults = results.filter(r => r.kind !== 'ok')

    // Exactly one should succeed; the rest should be 'used' or 'invalid'
    expect(okResults).toHaveLength(1)
    expect(invalidResults.length).toBe(2)
  })

  it('resets failed attempts on successful password entry', async () => {
    const link = makeSettledLink({
      accessType: 'PASSWORD',
      passwordHash: await bcrypt.hash('CORRECT-KEY', 10),
      failedAttempts: 3,
      lockedUntil: null,
    })
    const tx = makeMockTx(link)
    vi.mocked(prisma.$transaction).mockImplementation(async (cb: any) => cb(tx))

    const result = await shareLinkModule.consumeShareLink('test-token-xxx', {
      password: 'CORRECT-KEY',
    })

    expect(result.kind).toBe('ok')
  })
})

describe('revokeShareLink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('revokes a share link owned by the requesting user', async () => {
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(
      makeSettledLink({ revokedAt: null }) as any
    )
    vi.mocked(prisma.shareLink.update).mockResolvedValue({} as any)

    const result = await shareLinkModule.revokeShareLink('test-token-xxx', 'user-1')

    expect(result.kind).toBe('revoked')
    expect(prisma.shareLink.update).toHaveBeenCalledTimes(1)
  })

  it('returns not_found for a missing token', async () => {
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(null)

    const result = await shareLinkModule.revokeShareLink('nonexistent', 'user-1')

    expect(result.kind).toBe('not_found')
  })

  it('returns not_found if the user does not own the project (hides existence)', async () => {
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(
      makeSettledLink({ revokedAt: null }) as any
    )

    const result = await shareLinkModule.revokeShareLink('test-token-xxx', 'other-user')

    expect(result.kind).toBe('not_found')
  })

  it('returns already_revoked if already revoked', async () => {
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(
      makeSettledLink({ revokedAt: new Date('2025-06-01') }) as any
    )

    const result = await shareLinkModule.revokeShareLink('test-token-xxx', 'user-1')

    expect(result.kind).toBe('already_revoked')
  })
})
