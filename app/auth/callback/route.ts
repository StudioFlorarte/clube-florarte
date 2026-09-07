import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@/lib/supabase/server'
export async function GET(request:NextRequest){
 const origin=new URL(process.env.APP_URL||request.url).origin
 const code=request.nextUrl.searchParams.get('code')
 if(code){const {error}=await createClient().auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL('/set-password',origin))}
 return NextResponse.redirect(new URL('/set-password?error=invalidRecovery',origin))
}

