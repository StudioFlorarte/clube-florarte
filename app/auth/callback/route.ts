import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@/lib/supabase/server'
export async function GET(request:NextRequest){
 const origin=new URL(process.env.APP_URL||request.url).origin
 const code=request.nextUrl.searchParams.get('code')
 if(code){const {error}=await createClient().auth.exchangeCodeForSession(code);if(!error){
  const response=NextResponse.redirect(new URL('/set-password',origin));
  if(request.nextUrl.searchParams.get('lang')==='en')response.cookies.set('locale','en',{path:'/',maxAge:31536000,sameSite:'lax',secure:origin.startsWith('https:')});
  return response;
 }}
 return NextResponse.redirect(new URL('/set-password?error=invalidRecovery',origin))
}


