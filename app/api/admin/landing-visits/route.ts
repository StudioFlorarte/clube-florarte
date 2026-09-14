import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {visitPeriods,visitRange,type VisitPeriod} from '@/lib/landing-visit-filters';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
 const client=createClient();const {data:{user}}=await client.auth.getUser();if(!user)return NextResponse.json({error:'Unauthorized'},{status:401});
 const {data:profile}=await client.from('profiles').select('is_admin').eq('id',user.id).single();if(!profile?.is_admin)return NextResponse.json({error:'Forbidden'},{status:403});
 const period=request.nextUrl.searchParams.get('period')??'24h';if(!Object.prototype.hasOwnProperty.call(visitPeriods,period))return NextResponse.json({error:'Invalid period'},{status:400});
 const range=visitRange(period as VisitPeriod);const {data,error}=await client.rpc('landing_visit_countries',{since_time:range.since,until_time:range.until});
 if(error)return NextResponse.json({error:'Unavailable'},{status:503});return NextResponse.json({countries:data??[]},{headers:{'Cache-Control':'private, no-store'}});
}

