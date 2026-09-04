import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getT, getLocale } from '@/lib/locale-server'
import { localized } from '@/lib/i18n'
import CommentSection from './comment-section'
export default async function DropPage({ params }: { params: { id: string } }) {
 const client = createClient(); const t = getT(); const locale = getLocale()
 const { data: drop, error } = await client.from('drops').select('*').eq('id',params.id).maybeSingle()
 if (error) return <p role="alert">{t('loadError')}</p>
 if (!drop) notFound()
 return <div className="drop-detail"><Link className="back-link" href="/dashboard">← {t('back')}</Link><article className="card drop-card"><div className="drop-cover detail-cover">{(drop.detail_cover_url||drop.cover_url) && <img src={drop.detail_cover_url||drop.cover_url} alt="" style={{objectPosition:drop.detail_cover_position??drop.cover_position??'50% 50%'}} />}</div><div className="card-content">{localized(drop,'category',locale) && <span className="badge">{localized(drop,'category',locale)}</span>}<h1>{localized(drop,'title',locale)}</h1><p>{localized(drop,'description',locale)}</p><a href={drop.canva_url} target="_blank" rel="noopener noreferrer" className="btn-primary canva-link">{t('canva')} ↗</a></div></article><section className="drop-conversation"><h2 className="script">{t('conversation')}</h2><p>{t('conversationHelp')}</p><CommentSection dropId={drop.id} /></section></div>
}
