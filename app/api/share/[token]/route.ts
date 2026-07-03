import { NextResponse } from 'next/server'

import { getShareLinkStatus } from '@/lib/share-link'

export async function GET( _request: Request,
   { params }: { params: Promise<{ token: string }> }
  ) {
  const { token } = await params
  const result = await getShareLinkStatus(token)

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
    case 'password_required':
      return NextResponse.json({
        requiresPassword: true,
        shareLink: {
          id: result.shareLink.id,
          shareType: result.shareLink.shareType,
          accessType: result.shareLink.accessType,
          expiryAt: result.shareLink.expiryAt,
        },
      })
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
