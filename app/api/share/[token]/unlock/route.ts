import { NextResponse } from 'next/server'

import { consumeShareLink } from '@/lib/share-link'
import { checkRateLimit } from '@/lib/rate-limit'
import { unlockSchema } from '@/lib/schemas'

function getIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown'
}

export async function POST(request: Request, 
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const rateCheck = checkRateLimit(`unlock:${getIp(request)}`)
  if (!rateCheck.allowed) {
    return NextResponse.json({ error: 'Too many requests. Try again later.' }, {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil(rateCheck.resetIn / 1000)),
      },
    })
  }

  let body: unknown

  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const parsed = unlockSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'password is required' }, { status: 400 })
  }

  const result = await consumeShareLink(token, { password: parsed.data.password })

  switch (result.kind) {
    case 'ok':
      return NextResponse.json({
        project: result.project,
        shareLink: {
          id: result.shareLink.id,
          shareType: result.shareLink.shareType,
          accessType: result.shareLink.accessType,
          viewCount: result.shareLink.viewCount,
          expiryAt: result.shareLink.expiryAt,
        },
      })
    case 'invalid_password':
      return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
    case 'locked':
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
    case 'not_found':
      return NextResponse.json({ error: 'Share link not found' }, { status: 404 })
    case 'revoked':
      return NextResponse.json({ error: 'Share link revoked' }, { status: 403 })
    case 'expired':
    case 'used':
      return NextResponse.json({ error: 'Share link unavailable' }, { status: 410 })
    default:
      return NextResponse.json({ error: 'Share link unavailable' }, { status: 400 })
  }
}
