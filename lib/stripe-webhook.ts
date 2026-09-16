import { createHmac, timingSafeEqual } from 'node:crypto';
import { annualEnd } from './eduzz';

export const stripeLinks = {
  plink_1UG8nHB6uMvmU3zcTyuW9juy: {product:'prod_VGg95UwxDmMZ8w',locale:'pt'},
  plink_1UG93gB6uMvmU3zcajGIipSs: {product:'prod_VGgOzAJYZplZ8y',locale:'pt'},
  plink_1UG945B6uMvmU3zcuAbibyJQ: {product:'prod_VGgPZhHflXlyZo',locale:'en'},
} as const;

export function verifyStripeSignature(raw: string, header: string | null, secret: string, now = Date.now()) {
  const timestamp = header?.match(/(?:^|,)t=(\d+)/)?.[1];
  const signatures = [...(header || '').matchAll(/(?:^|,)v1=([0-9a-f]{64})/gi)].map(match=>match[1]);
  if (!timestamp || !signatures.length || !secret.startsWith('whsec_')) return false;
  if (Math.abs(now - Number(timestamp) * 1000) > 300_000) return false;
  const expected = createHmac('sha256',secret).update(`${timestamp}.${raw}`).digest();
  return signatures.some(signature => timingSafeEqual(expected,Buffer.from(signature,'hex')));
}

export function parseStripeEvent(event: any) {
  if (typeof event?.id !== 'string' || event.livemode !== false) throw new Error('invalid_stripe_event');
  const data = event.data?.object;
  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    if (data?.mode !== 'subscription' || data?.payment_status !== 'paid') return null;
    const link = stripeLinks[data.payment_link as keyof typeof stripeLinks];
    if (!link) return null;
    const email = String(data.customer_details?.email || data.customer_email || '').trim().toLowerCase();
    const subscription = data.subscription;
    if (!/^\S+@\S+\.\S+$/.test(email) || typeof subscription !== 'string' || !subscription.startsWith('sub_')) throw new Error('invalid_checkout_session');
    const paidAt = new Date(event.created * 1000).toISOString();
    const locale = data.payment_link === 'plink_1UG93gB6uMvmU3zcajGIipSs' && data.client_reference_id === 'florarte_en_eur' ? 'en' : link.locale;
    return {kind:'paid' as const,eventId:event.id,invoice:`stripe:${subscription}`,email,product:link.product,locale,name:String(data.customer_details?.name || '').slice(0,100),paidAt,end:annualEnd(paidAt)};
  }
  if (event.type === 'customer.subscription.deleted') {
    if (typeof data?.id !== 'string' || !data.id.startsWith('sub_')) throw new Error('invalid_subscription');
    return {kind:'cancelled' as const,eventId:event.id,invoice:`stripe:${data.id}`};
  }
  if (event.type === 'invoice.paid' && data?.billing_reason === 'subscription_cycle' && data.status === 'paid') {
    const subscription = data.parent?.subscription_details?.subscription || data.subscription;
    const periodEnd = Math.max(...(data.lines?.data || []).map((line:any)=>Number(line.period?.end) || 0));
    if (typeof subscription !== 'string' || !subscription.startsWith('sub_') || !Number.isFinite(periodEnd) || periodEnd <= event.created) throw new Error('invalid_renewal');
    return {kind:'renewal' as const,eventId:event.id,invoice:`stripe:${subscription}`,end:new Date(periodEnd*1000).toISOString()};
  }
  return null;
}

