import { createClient } from '@/lib/supabase/server'
import { getT } from '@/lib/locale-server'
import PaletteGrid from './palette-grid'
export default async function PalettesPage(){const t=getT();const client=createClient();const [p,f]=await Promise.all([client.from('palettes').select('*').order('created_at',{ascending:false}),client.from('font_pairs').select('*').order('created_at',{ascending:false})]);return <div><h1>{t('palettes')}</h1><p>{t('paletteHelp')}</p>{p.error?<p role="alert">{t('loadError')}</p>:!p.data?.length&&<p>{t('empty')}</p>}<PaletteGrid palettes={p.data||[]} fonts={f.data||[]}/>{f.error&&<p role="alert">{t('loadError')}</p>}</div>}
