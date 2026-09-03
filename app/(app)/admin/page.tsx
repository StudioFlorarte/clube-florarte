import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getT } from '@/lib/locale-server'
import ResourceForm from './resource-form'
import { getLocale } from '@/lib/locale-server'
import { localized } from '@/lib/i18n'
import Link from 'next/link'
export default async function AdminPage(){
 const client=createClient();const t=getT();const locale=getLocale()
 const {data:{user}}=await client.auth.getUser();if(!user)redirect('/login')
 const {data:profile}=await client.from('profiles').select('is_admin').eq('id',user.id).single();if(!profile?.is_admin)redirect('/dashboard')
 const [members,drops]=await Promise.all([client.from('profiles').select('id',{count:'exact',head:true}),client.from('drops').select('id,title,translations').order('created_at',{ascending:false})])
 return <div><h1>{t('admin')}</h1><p>{t('memberCount')}: {members.error?'—':members.count??0}</p><ResourceForm/><h2>{t('publishedDrops')}</h2><div className="card form-card">{drops.error?<p role="alert">{t('loadError')}</p>:drops.data?.map(drop=><p key={drop.id}><Link href={`/drops/${drop.id}`}>{localized(drop,'title',locale)} ↗</Link></p>)}{!drops.error&&!drops.data?.length&&<p>{t('empty')}</p>}</div></div>
}
