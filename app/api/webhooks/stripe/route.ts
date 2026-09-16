import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { activeCampaignConfigured } from '@/lib/activecampaign';
import { deliverMemberInvitation } from '@/lib/member-invitation';
import { parseStripeEvent, verifyStripeSignature } from '@/lib/stripe-webhook';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const site = process.env.APP_URL;
  if (!secret || !site || !process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({error:'not_configured'},{status:503});
  const raw = await request.text();
  if (Buffer.byteLength(raw) > 256000) return new NextResponse(null,{status:413});
  if (!verifyStripeSignature(raw,request.headers.get('stripe-signature'),secret)) return new NextResponse(null,{status:401});
  let event;
  try { event = parseStripeEvent(JSON.parse(raw)); } catch { return NextResponse.json({error:'invalid_event'},{status:422}); }
  if (!event) return NextResponse.json({ignored:true});
  const admin = createAdminClient();
  if (event.kind === 'renewal') {
    const {error} = await admin.rpc('process_stripe_renewal',{p_event_id:event.eventId,p_invoice:event.invoice,p_end:event.end});
    return error ? NextResponse.json({error:'processing_failed'},{status:500}) : NextResponse.json({ok:true});
  }
  if (event.kind === 'cancelled') {
    const {error} = await admin.rpc('process_stripe_cancellation',{p_event_id:event.eventId,p_invoice:event.invoice});
    return error ? NextResponse.json({error:'processing_failed'},{status:500}) : NextResponse.json({ok:true});
  }
  if (!activeCampaignConfigured() || process.env.ACTIVECAMPAIGN_INVITATIONS_ENABLED !== 'true') return NextResponse.json({error:'invitation_delivery_not_ready'},{status:503});
  const {error} = await admin.rpc('process_stripe_checkout',{p_event_id:event.eventId,p_invoice:event.invoice,p_email:event.email,p_product:event.product,p_locale:event.locale,p_paid_at:event.paidAt,p_end:event.end});
  if (error) return NextResponse.json({error:'processing_failed'},{status:500});
  try { await deliverMemberInvitation(event,site.replace(/\/$/,'')); }
  catch { return NextResponse.json({error:'invitation_delivery_failed'},{status:502}); }
  return NextResponse.json({ok:true});
}

