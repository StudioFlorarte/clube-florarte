import { createClient } from '@/lib/supabase/server'
import { getT } from '@/lib/locale-server'
import PaletteGrid from './palette-grid'
export default async function PalettesPage(){const t=getT();const p=await createClient().from('palettes').select('*').order('created_at',{ascending:false});return <div><h1>{t('palettes')}</h1><p>{t('paletteHelp')}</p>{p.error?<p role="alert">{t('loadError')}</p>:!p.data?.length&&<p>{t('empty')}</p>}<PaletteGrid palettes={p.data||[]}/></div>}
