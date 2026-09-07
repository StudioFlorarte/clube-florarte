import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function GET(request: NextRequest) {
  const client = createClient()
  const { data: { user } } = await client.auth.getUser()
  if (!user) return new NextResponse(null, { status: 401 })
  const bucket = request.nextUrl.searchParams.get('bucket')
  const path = request.nextUrl.searchParams.get('path') || ''
  const valid = bucket === 'club-icons'
    ? /^(collage|ios-core|ios-emoji|nature|tribal|vintage|y2k)(-\d{3}\.png|\.zip)$/.test(path)
    : bucket === 'feed-assets' && /^[a-f0-9-]{36}\/[a-f0-9-]{36}\.(png|jpg|webp|gif|mp4|webm|pdf|docx|pptx|xlsx|txt)$/.test(path)
  if (!valid || !bucket) return new NextResponse(null, { status: 400 })
  const { data, error } = await client.storage.from(bucket).createSignedUrl(path, 3600, request.nextUrl.searchParams.get('download') === '1' ? { download: path.split('/').pop() } : undefined)
  if (error || !data) return new NextResponse(null, { status: 404 })
  return NextResponse.redirect(data.signedUrl, { headers: { 'Cache-Control': 'private, no-store' } })
}
