import crypto from 'node:crypto'

import bcrypt from 'bcryptjs'

import prisma from '@/lib/prisma'

export type ShareType = 'ONE_TIME' | 'TIME_BASED'
export type AccessType = 'PUBLIC' | 'PASSWORD'

export type ShareAccessKind =
  | 'ok'
  | 'password_required'
  | 'invalid_password'
  | 'not_found'
  | 'revoked'
  | 'expired'
  | 'used'
  | 'invalid'

function generateSecureToken() {
  return crypto.randomBytes(32).toString('hex')
}

function generatePasswordKey() {
  return crypto.randomBytes(3).toString('hex').toUpperCase()
}

function normalizeExpiry(expiryAt: string | Date | null | undefined) {
  if (!expiryAt) {
    return null
  }

  if (expiryAt instanceof Date) {
    return expiryAt
  }

  const parsed = new Date(expiryAt)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export async function createShareLink(options: {
  projectId: string
  shareType: ShareType
  accessType: AccessType
  expiryAt?: string | Date | null
  password?: string | null
}) {
  const token = generateSecureToken()
  const expiry = normalizeExpiry(options.expiryAt)
  const passwordKey = options.accessType === 'PASSWORD' ? options.password?.trim() || generatePasswordKey() : null
  const passwordHash = passwordKey ? await bcrypt.hash(passwordKey, 10) : null

  const shareLink = await prisma.shareLink.create({
    data: {
      token,
      projectId: options.projectId,
      shareType: options.shareType,
      accessType: options.accessType,
      passwordHash,
      expiryAt: expiry,
    },
  })

  return {
    shareUrl: `/share/${shareLink.token}`,
    token: shareLink.token,
    password: passwordKey,
    shareLink,
  }
}

export async function getShareLinkStatus(token: string) {
  const shareLink = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          description: true,
          content: true,
        },
      },
    },
  });

  if (!shareLink) {
    return { kind: "not_found" as const };
  }

  if (shareLink.revokedAt) {
    return { kind: "revoked" as const, shareLink };
  }

  if (
    shareLink.shareType === "ONE_TIME" &&
    shareLink.usedAt
  ) {
    return { kind: "used" as const, shareLink };
  }

  if (
    shareLink.expiryAt &&
    new Date() > shareLink.expiryAt
  ) {
    return { kind: "expired" as const, shareLink };
  }


  if (shareLink.accessType === "PASSWORD") {
    return {
      kind: "password_required" as const,
      shareLink,
    };
  }


  return {
    kind: "ok" as const,
    project: shareLink.project,
    shareLink,
  };
}

export async function consumeShareLink(token: string, options?: { password?: string | null }) {
  const now = new Date()

  const result = await prisma.$transaction(async (tx) => {
    const shareLink = await tx.shareLink.findUnique({
      where: { token },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            content: true,
          },
        },
      },
    })

    if (!shareLink) {
      return { kind: 'not_found' as const }
    }

    if (shareLink.revokedAt) {
      return { kind: 'revoked' as const, shareLink }
    }

    if (shareLink.shareType === 'ONE_TIME' && shareLink.usedAt) {
      return { kind: 'used' as const, shareLink }
    }

    if (shareLink.expiryAt && now > shareLink.expiryAt) {
      return { kind: 'expired' as const, shareLink }
    }

    if (shareLink.accessType === 'PASSWORD') {
      if (!options?.password) {
        return { kind: 'password_required' as const, shareLink }
      }

      const isValidPassword = await bcrypt.compare(options.password, shareLink.passwordHash ?? '')
      if (!isValidPassword) {
        return { kind: 'invalid_password' as const, shareLink }
      }
    }

    const updateResult = await tx.shareLink.updateMany({
      where: {
        token,
        revokedAt: null,
        ...(shareLink.shareType === 'ONE_TIME' ? { usedAt: null } : {}),
        OR: [{ expiryAt: null }, { expiryAt: { gt: now } }],
      },
      data: {
        viewCount: { increment: 1 },
        ...(shareLink.shareType === 'ONE_TIME' ? { usedAt: now } : {}),
      },
    })

    if (updateResult.count === 0) {
      return { kind: 'invalid' as const, shareLink }
    }

    return {
      kind: 'ok' as const,
      shareLink: {
        ...shareLink,
        viewCount: shareLink.viewCount + 1,
        usedAt: shareLink.shareType === 'ONE_TIME' ? now : shareLink.usedAt,
      },
      project: shareLink.project,
    }
  })

  return result
}

export async function revokeShareLink(token: string, userId: string) {
  const shareLink = await prisma.shareLink.findUnique({
  where: { token },
  select: {
    id: true,
    revokedAt: true,
    project: {
      select: {
        ownerId: true,
      },
    },
  },
})

 
  if (!shareLink) {
    return { kind: "not_found" as const }
  }

  // Check project owner
  if (shareLink.project.ownerId !== userId) {
    return { kind: "not_found" as const }
  }

  if (shareLink.revokedAt) {
    return { kind: "already_revoked" as const }
  }

  await prisma.shareLink.update({
    where: { id: shareLink.id },
    data: {
      revokedAt: new Date(),
    },
  })

  return { kind: "revoked" as const }
}
