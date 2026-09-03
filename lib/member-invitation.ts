import { randomUUID } from 'node:crypto'
import { createAdminClient } from './supabase/admin'
import { deliverInvitation } from './activecampaign'

export async function deliverMemberInvitation(invoice: {invoice:string; email:string; name:string; locale:'pt'|'en'}, site: string) {
  const admin = createAdminClient()
  const lease = randomUUID()
  const claim = await admin.rpc('claim_club_invitation', {p_email:invoice.email,p_lease:lease})
  if (claim.error || !claim.data) throw new Error('invitation_busy')
  try {
    // Re-read after acquiring the per-email lease, so webhook retries are serialized.
    const result = await admin.from('subscriptions').select('user_id,status,invite_sent_at,current_period_end').eq('invoice_id',invoice.invoice).single()
    if (result.error) throw new Error('subscription_read_failed')
    const subscription = result.data
    if (subscription.status !== 'active' || new Date(subscription.current_period_end).getTime() <= Date.now() || subscription.invite_sent_at) return
    let established = false
    let confirmed = false
    if (subscription.user_id) {
      const user = await admin.auth.admin.getUserById(subscription.user_id)
      if (user.error) throw new Error('user_lookup_failed')
      established = !!user.data.user.last_sign_in_at
      confirmed = !!user.data.user.email_confirmed_at
    }
    if (!established) {
      const saved = await admin.from('club_invitation_links').select('token_hash,token_type,generated_at').eq('email',invoice.email).single()
      if (saved.error) throw new Error('invitation_read_failed')
      let token = saved.data.token_hash
      let type = saved.data.token_type
      // Only refresh undelivered links. Completed invoice deliveries return above.
      if (!token || !saved.data.generated_at || Date.now()-new Date(saved.data.generated_at).getTime()>30*60*1000) {
        type = confirmed ? 'recovery' : 'invite'
        const generated = await admin.auth.admin.generateLink({type,email:invoice.email,options:{redirectTo:`${site}/set-password`,data:{display_name:invoice.name}}})
        if (generated.error || !generated.data.properties?.hashed_token) throw new Error('invitation_generation_failed')
        token = generated.data.properties.hashed_token
        const write = await admin.from('club_invitation_links').update({token_hash:token,token_type:type,generated_at:new Date().toISOString()}).eq('email',invoice.email).eq('lease_id',lease)
        if (write.error) throw new Error('invitation_store_failed')
      }
      const url = new URL('/activate',site)
      url.searchParams.set('token_hash',token)
      url.searchParams.set('type',type)
      url.searchParams.set('lang',invoice.locale)
      await deliverInvitation({email:invoice.email,name:invoice.name,locale:invoice.locale,url:url.toString()})
    }
    const marked = await admin.from('subscriptions').update({invite_sent_at:new Date().toISOString()}).eq('invoice_id',invoice.invoice)
    if (marked.error) throw new Error('invitation_status_failed')
  } finally {
    await admin.from('club_invitation_links').update({lease_id:null,locked_until:null}).eq('email',invoice.email).eq('lease_id',lease)
  }
}
