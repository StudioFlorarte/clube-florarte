import { NextRequest,NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseInvoice,validSignature } from '@/lib/eduzz'
import { activeCampaignConfigured } from '@/lib/activecampaign'
import { deliverMemberInvitation } from '@/lib/member-invitation'
export const runtime='nodejs'
export async function POST(request:NextRequest){
 const secret=process.env.EDUZZ_WEBHOOK_SECRET;const site=process.env.APP_URL
 if(!secret||!site||!process.env.SUPABASE_SERVICE_ROLE_KEY)return NextResponse.json({error:'not_configured'},{status:503})
 const raw=await request.text();if(Buffer.byteLength(raw)>256000)return new NextResponse(null,{status:413})
 if(!validSignature(raw,request.headers.get('x-signature'),secret))return new NextResponse(null,{status:401})
 let invoice;try{invoice=parseInvoice(JSON.parse(raw))}catch{return NextResponse.json({error:'invalid_invoice'},{status:422})}
 if(!invoice)return NextResponse.json({ignored:true})
 if(invoice.event==='myeduzz.invoice_paid'&&(!activeCampaignConfigured()||process.env.ACTIVECAMPAIGN_INVITATIONS_ENABLED!=='true'))return NextResponse.json({error:'invitation_delivery_not_ready'},{status:503})
 const admin=createAdminClient()
 const {error}=await admin.rpc('process_eduzz_invoice',{p_event_id:invoice.eventId,p_event:invoice.event,p_invoice:invoice.invoice,p_email:invoice.email,p_product:invoice.product,p_contract:invoice.contract,p_paid_at:invoice.paidAt,p_end:invoice.end})
 if(error)return NextResponse.json({error:'processing_failed'},{status:500})
 if(invoice.event==='myeduzz.invoice_paid'){
   try{await deliverMemberInvitation(invoice,site.replace(/\/$/,''))}catch{return NextResponse.json({error:'invitation_delivery_failed'},{status:502})}
 }
 return NextResponse.json({ok:true})
}
