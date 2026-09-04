import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getLocale, getT } from '@/lib/locale-server'
import { localized } from '@/lib/i18n'
export default async function DashboardPage() {
 const client = createClient(); const t = getT(); const locale = getLocale()
 const { data: drops, error } = await client.from('drops').select('id,title,cover_url,cover_position,category,description,created_at,translations').order('created_at',{ascending:false})
 return <div><section className="hero-banner"><div className="hero-copy"><p className="script">{t('yourDrops')}</p><h1>{t('library')}</h1><p>{t('libraryHelp')}</p></div><img className="hero-brand-flower" src="/brand/lirio.png" alt="" aria-hidden="true"/></section><div className="resource-grid">{drops?.map(drop => <Link key={drop.id} href={`/drops/${drop.id}`} className="card drop-card"><div className="drop-cover">{drop.cover_url && <img src={drop.cover_url} alt="" style={{objectPosition:drop.cover_position??'50% 50%'}} />}</div><div className="card-content">{localized(drop,'category',locale) && <span className="badge">✣ {localized(drop,'category',locale)}</span>}<h2>{localized(drop,'title',locale)} <span aria-hidden>↗</span></h2><p className="clamp">{localized(drop,'description',locale)}</p></div></Link>)}</div>{error ? <p role="alert">{t('loadError')}</p> : !drops?.length && <p>{t('empty')}</p>}</div>
}
