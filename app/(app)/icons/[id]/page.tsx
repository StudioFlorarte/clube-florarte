import Link from 'next/link'
import {notFound} from 'next/navigation'
import {createClient} from '@/lib/supabase/server'
import {getLocale,getT} from '@/lib/locale-server'
import {localized} from '@/lib/i18n'
import {assetUrl,communityText} from '@/lib/community'
export default async function IconCollection({params}:{params:{id:string}}){const locale=getLocale(),t=getT();const {data:pack}=await createClient().from('icon_packs').select('*').eq('id',params.id).maybeSingle();if(!pack)notFound();const title=localized(pack,'title',locale);return <div><Link href="/icons">← {t('icons')}</Link><div className="collection-heading"><h1>{title}</h1>{pack.zip_path&&<a className="btn-primary" href={assetUrl('club-icons',pack.zip_path,true)}>{communityText(locale,'zip')} ↓</a>}</div><div className="icon-gallery">{(pack.assets||[]).map((a:{path:string},i:number)=><article className="card icon-tile" key={a.path}><img loading="lazy" src={assetUrl('club-icons',a.path)} alt={`${title} ${i+1}`}/><a href={assetUrl('club-icons',a.path,true)} aria-label={`${communityText(locale,'png')} ${i+1}`}>{communityText(locale,'png')} ↓</a></article>)}</div>{!(pack.assets||[]).length&&pack.canva_url&&<a href={pack.canva_url} target="_blank" rel="noopener noreferrer">{t('canva')} ↗</a>}</div>}
