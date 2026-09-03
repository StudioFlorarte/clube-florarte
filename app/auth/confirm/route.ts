import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
export async function GET(request: NextRequest) {
  const token_hash = request.nextUrl.searchParams.get('token_hash'); const type = request.nextUrl.searchParams.get('type')
  if (token_hash && (type === 'invite' || type === 'recovery')) {
    const { error } = await createClient().auth.verifyOtp({ token_hash, type })
    if (!error) return NextResponse.redirect(new URL('/set-password', request.url))
  }
  return NextResponse.redirect(new URL('/login?error=invalidInvite', request.url))
}

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return new NextResponse(null,{status:403})
  const form = await request.formData()
  const token_hash = form.get('token_hash'); const type = form.get('type')
  if (typeof token_hash === 'string' && (type === 'invite' || type === 'recovery')) {
    const { error } = await createClient().auth.verifyOtp({token_hash,type})
    if (!error) {
      const response=NextResponse.redirect(new URL('/set-password',request.url),303)
      response.cookies.set('locale',form.get('lang')==='en'?'en':'pt',{path:'/',maxAge:31536000,sameSite:'lax',secure:request.nextUrl.protocol==='https:'})
      return response
    }
  }
  return NextResponse.redirect(new URL('/login?error=invalidInvite',request.url),303)
}
