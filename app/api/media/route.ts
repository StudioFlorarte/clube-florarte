import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
export async function GET(request: NextRequest) {
  const client = createClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return new NextResponse(null, { status: 401 })
  const path = request.nextUrl.searchParams.get('path')
  if (!path || !/^(covers|avatars)\/[a-f0-9-]+\/[a-f0-9-]+\.(jpg|png|webp)$/.test(path)) return new NextResponse(null, { status: 400 })
  const { data, error } = await client.storage.from('club-media').createSignedUrl(path, 60)
  if (error || !data) return new NextResponse(null, { status: 404 })
  return NextResponse.redirect(data.signedUrl, { headers: { 'Cache-Control': 'private, no-store' } })
}
