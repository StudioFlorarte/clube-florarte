import { NextRequest,NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseInvoice,validSignature } from '@/lib/eduzz'
export const runtime='nodejs'
export async function POST(request:NextRequest){
 const secret=process.env.EDUZZ_WEBHOOK_SECRET;const site=process.env.APP_URL
 if(!secret||!site||!process.env.SUPABASE_SERVICE_ROLE_KEY)return NextResponse.json({error:'not_configured'},{status:503})
 const raw=await request.text();if(Buffer.byteLength(raw)>256000)return new NextResponse(null,{status:413})
 if(!validSignature(raw,request.headers.get('x-signature'),secret))return new NextResponse(null,{status:401})
 let invoice;try{invoice=parseInvoice(JSON.parse(raw))}catch{return NextResponse.json({error:'invalid_invoice'},{status:422})}
 if(!invoice)return NextResponse.json({ignored:true})
 const admin=createAdminClient()
 const {error}=await admin.rpc('process_eduzz_invoice',{p_event_id:invoice.eventId,p_event:invoice.event,p_invoice:invoice.invoice,p_email:invoice.email,p_product:invoice.product,p_contract:invoice.contract,p_paid_at:invoice.paidAt,p_end:invoice.end})
 if(error)return NextResponse.json({error:'processing_failed'},{status:500})
 if(invoice.event==='myeduzz.invoice_paid'){
   const {data:subscription,error:readError}=await admin.from('subscriptions').select('user_id,status,invite_sent_at').eq('invoice_id',invoice.invoice).single()
   if(readError)return NextResponse.json({error:'processing_failed'},{status:500})
   if(subscription.status==='active'&&!subscription.invite_sent_at){
     let established=false
     if(subscription.user_id){const {data,error}=await admin.auth.admin.getUserById(subscription.user_id);if(error)return NextResponse.json({error:'user_lookup_failed'},{status:500});established=!!data.user?.last_sign_in_at}
     if(!established){const {error:inviteError}=await admin.auth.admin.inviteUserByEmail(invoice.email,{redirectTo:`${site.replace(/\/$/,'')}/set-password`,data:{display_name:invoice.name}});if(inviteError)return NextResponse.json({error:'invitation_failed'},{status:502})}
     const {error:markError}=await admin.from('subscriptions').update({invite_sent_at:new Date().toISOString()}).eq('invoice_id',invoice.invoice)
     if(markError)return NextResponse.json({error:'invitation_status_failed'},{status:500})
   }
 }
 return NextResponse.json({ok:true})
}
