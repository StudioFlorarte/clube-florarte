import {NextRequest,NextResponse} from 'next/server'
import {trustedAppOrigin} from '@/lib/app-origin'
import {createClient} from '@/lib/supabase/server'
import {validLocale} from '@/lib/i18n'
import {isAuthTokenHash} from '@/lib/recovery'
export async function GET(request:NextRequest){
 const url=new URL('/activate',process.env.APP_URL||'https://studioflorarte.com')
 for(const key of ['token_hash','type','lang']){const value=request.nextUrl.searchParams.get(key);if(value)url.searchParams.set(key,value)}
 return NextResponse.redirect(url)
}
export async function POST(request:NextRequest){
 const origin=trustedAppOrigin(request.headers.get('origin'),request.url)
 if(!origin)return new NextResponse(null,{status:403})
 const form=await request.formData(),token_hash=form.get('token_hash'),type=form.get('type'),lang=validLocale(String(form.get('lang')||''))
 if(isAuthTokenHash(token_hash)&&(type==='invite'||type==='recovery')){
  const {error}=await createClient().auth.verifyOtp({token_hash,type})
  if(!error){const response=NextResponse.redirect(new URL('/set-password',origin),303);response.cookies.set('locale',lang,{path:'/',maxAge:31536000,sameSite:'lax',secure:origin.startsWith('https:')});return response}
 }
 return NextResponse.redirect(new URL(`/reset-password?lang=${lang}&error=invalid`,origin),303)
}

