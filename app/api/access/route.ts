import {NextRequest,NextResponse} from 'next/server';
import {createAdminClient} from '@/lib/supabase/admin';
import {trustedAppOrigin} from '@/lib/app-origin';

export const runtime='nodejs';
export async function POST(request:NextRequest){
  const origin=trustedAppOrigin(request.headers.get('origin'),request.url);
  if(!origin)return new NextResponse(null,{status:403});
  if(Number(request.headers.get('content-length')||0)>2048)return new NextResponse(null,{status:413});
  let input:{email?:unknown;locale?:unknown};
  try{input=await request.json();}catch{return new NextResponse(null,{status:400});}
  const email=typeof input.email==='string'?input.email.trim().toLowerCase():'';
  const locale=input.locale==='en'?'en':'pt';
  if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return new NextResponse(null,{status:400});
  const admin=createAdminClient();
  const {data:allowed,error}=await admin.rpc('request_stripe_access',{p_email:email});
  if(error)return NextResponse.json({error:'temporarily_unavailable'},{status:503});
  // The response is identical for unknown addresses and throttled requests.
  if(!allowed)return NextResponse.json({ok:true});
  const {data:subscription,error:lookupError}=await admin.from('subscriptions').select('user_id').eq('email',email).eq('status','active').in('product_id',['prod_VGg95UwxDmMZ8w','prod_VGgOzAJYZplZ8y','prod_VGgPZhHflXlyZo']).gt('current_period_end',new Date().toISOString()).order('paid_at',{ascending:false}).limit(1).maybeSingle();
  if(lookupError||!subscription)return NextResponse.json({error:'temporarily_unavailable'},{status:503});
  const redirectTo=`${new URL(process.env.APP_URL||origin).origin}/set-password?lang=${locale}`;
  let result;
  if(subscription.user_id){result=await admin.auth.resetPasswordForEmail(email,{redirectTo});}
  else {result=await admin.auth.admin.inviteUserByEmail(email,{redirectTo});}
  if(result.error){console.error('stripe_access_delivery_failed',result.error.message);return NextResponse.json({error:'temporarily_unavailable'},{status:503});}
  return NextResponse.json({ok:true});
}

