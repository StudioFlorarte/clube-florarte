import Link from 'next/link'
import {createClient} from '@/lib/supabase/server'
import {getT,getLocale} from '@/lib/locale-server'
import {localized} from '@/lib/i18n'
import {assetUrl,communityText} from '@/lib/community'
export default async function IconsPage(){const t=getT(),locale=getLocale();const {data,error}=await createClient().from('icon_packs').select('*').order('title');return <div><h1>{t('icons')}</h1><p>{communityText(locale,'iconHelp')}</p><div className="resource-grid">{data?.map(pack=><Link className="card icon-collection" key={pack.id} href={`/icons/${pack.id}`}><div className="icon-preview">{(pack.assets||[]).slice(0,4).map((a:{path:string})=><img key={a.path} src={assetUrl('club-icons',a.path)} alt="" loading="lazy"/>)}</div><h2>{localized(pack,'title',locale)} <span aria-hidden>↗</span></h2></Link>)}</div>{error&&<p role="alert">{t('loadError')}</p>}</div>}
