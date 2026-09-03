import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { deliverMemberInvitation } from '@/lib/member-invitation'
import { productLocales } from '@/lib/eduzz'

async function requireAdmin() {
 const client=createClient()
 const {data:{user}}=await client.auth.getUser()
 if(!user)redirect('/login')
 const {data:profile}=await client.from('profiles').select('is_admin').eq('id',user.id).single()
 if(!profile?.is_admin)redirect('/dashboard')
}

async function sendPending(form:FormData) {
 'use server'
 await requireAdmin()
 const invoice=form.get('invoice')
 if(typeof invoice!=='string')redirect('/admin/invitations?result=invalid')
 const admin=createAdminClient()
 const {data:row,error}=await admin.from('subscriptions').select('invoice_id,email,product_id,status,current_period_end,invite_sent_at').eq('invoice_id',invoice).single()
 if(error||!row||row.status!=='active'||row.invite_sent_at||new Date(row.current_period_end).getTime()<=Date.now())redirect('/admin/invitations?result=unavailable')
 let outcome='scheduled'
 try {
  const site=process.env.APP_URL
  if(!site)throw new Error('site_not_configured')
  const locale=productLocales[row.product_id]
  if(!locale)throw new Error('unknown_product')
  await deliverMemberInvitation({invoice:row.invoice_id,email:row.email,name:'',locale},site)
 } catch(error) {
  const code=error instanceof Error?error.message:''
  outcome=/^(invitation_[a-z_]+|activecampaign_[a-z_0-9]+|subscription_read_failed|user_lookup_failed|site_not_configured|unknown_product)$/.test(code)?code:'delivery_failed'
 }
 redirect(`/admin/invitations?result=${encodeURIComponent(outcome)}`)
}

export default async function Invitations({searchParams}:{searchParams:{result?:string}}) {
 await requireAdmin()
 const {data:rows,error}=await createAdminClient().from('subscriptions').select('invoice_id,email,product_id,invite_sent_at,current_period_end').eq('status','active').gt('current_period_end',new Date().toISOString()).order('updated_at',{ascending:false}).limit(100)
 return <div><h1>Convites de acesso</h1><p>Envie convites pendentes de assinaturas válidas. As automações correspondentes devem estar ativas no ActiveCampaign.</p>
 {searchParams.result&&<p role="status">{searchParams.result==='scheduled'?'Convite processado. Confira a entrega no ActiveCampaign.':`Envio não concluído: ${searchParams.result}`}</p>}
 {error?<p role="alert">Não foi possível carregar os convites.</p>:rows?.map(row=><section className="card form-card" key={row.invoice_id}>
 <h2>{row.email}</h2><p>{row.product_id==='3098697'?'English':'Português'} · {row.invoice_id.startsWith('test:')?'Teste temporário':'Assinatura'} · {row.invoice_id}</p>
 {row.invite_sent_at?<p>Convite já processado.</p>:<form action={sendPending}><input type="hidden" name="invoice" value={row.invoice_id}/><button type="submit">Enviar convite para {row.email}</button></form>}
 </section>)}
 </div>
}
