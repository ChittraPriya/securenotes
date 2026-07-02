import { NextResponse } from 'next/server'

import { consumeShareLink } from '@/lib/share-link'

export async function POST(request: Request, 
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  let body: unknown

  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const parsedBody = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {}
  const rawPassword = parsedBody.password

  if (typeof rawPassword !== 'string' || rawPassword.trim() === '') {
    return NextResponse.json({ error: 'password is required' }, { status: 400 })
  }

  const result = await consumeShareLink(token, { password: rawPassword })

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
