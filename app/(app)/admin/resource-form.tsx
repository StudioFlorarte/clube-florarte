'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadImage } from '@/lib/uploads'
import { useLanguage } from '@/app/language-provider'
import { locales, languageNames, Locale, Key } from '@/lib/i18n'
type Kind = 'drops'|'palettes'|'font_pairs'|'icon_packs'
const emptyTranslations = () => Object.fromEntries(locales.map(l=>[l,{title:'',description:'',category:''}])) as Record<Locale,{title:string;description:string;category:string}>
export default function ResourceForm() {
 const {t}=useLanguage(); const router=useRouter(); const [kind,setKind]=useState<Kind>('drops'); const [tr,setTr]=useState(emptyTranslations); const [url,setUrl]=useState(''); const [colors,setColors]=useState('#B00E42, #FF3965, #FFD55B'); const [heading,setHeading]=useState(''); const [body,setBody]=useState(''); const [file,setFile]=useState<File|null>(null); const [busy,setBusy]=useState(false); const [message,setMessage]=useState(''); const [fileKey,setFileKey]=useState(0)
 const kinds:[Kind,Key][]=[['drops','newDrop'],['palettes','newPalette'],['font_pairs','newFont'],['icon_packs','newIcon']]
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage('');try{
   if(locales.some(l=>!tr[l].title.trim()||!tr[l].description.trim()||(kind==='drops'&&!tr[l].category.trim())))throw new Error('invalidFields')
   if(kind!=='palettes'&&url){const parsed=new URL(url);if(parsed.protocol!=='https:'||(kind!=='font_pairs'&&parsed.hostname!=='canva.com'&&!parsed.hostname.endsWith('.canva.com')))throw new Error('invalidFields')}
   const row:any={title:tr.pt.title.trim(),description:tr.pt.description.trim(),translations:tr}
   if(kind==='drops'||kind==='icon_packs'){row.canva_url=url;row.cover_url=file?await uploadImage(file,'covers'):null}
   if(kind==='drops')row.category=tr.pt.category.trim()
   if(kind==='palettes'){row.colors=colors.split(',').map(c=>c.trim());if(row.colors.length<2||row.colors.length>12||row.colors.some((c:string)=>!/^#[a-f0-9]{6}$/i.test(c)))throw new Error('invalidFields')}
   if(kind==='font_pairs'){row.heading_font=heading.trim();row.body_font=body.trim();row.url=url||null}
   const {error}=await createClient().from(kind).insert(row);if(error)throw error
   setTr(emptyTranslations());setUrl('');setFile(null);setHeading('');setBody('');setFileKey(v=>v+1);setMessage(t('published'));router.refresh()
 }catch(e){const key=e instanceof Error&&['invalidFields','invalidFile'].includes(e.message)?e.message as Key:'error';setMessage(t(key))}finally{setBusy(false)}}
 return <><div className="admin-tabs">{kinds.map(([value,key])=><button type="button" className="btn-secondary" disabled={busy} key={value} aria-pressed={kind===value} onClick={()=>{setKind(value);setMessage('');setUrl('');setFile(null);setFileKey(v=>v+1)}}>{t(key)}</button>)}</div><form onSubmit={submit} className="card form-card"><h2>{t(kinds.find(([value])=>value===kind)![1])}</h2><p>{t('translationHelp')}</p>
 {locales.map(l=><fieldset className="translation-fields" key={l}><legend>{languageNames[l]}</legend>{(['title','description',...(kind==='drops'?['category']:[])] as const).map(field=><label key={field}>{t(field as Key)}{field==='description'?<textarea required maxLength={3000} value={tr[l].description} onChange={e=>setTr({...tr,[l]:{...tr[l],description:e.target.value}})} />:<input required maxLength={160} value={tr[l][field as 'title'|'category']} onChange={e=>setTr({...tr,[l]:{...tr[l],[field]:e.target.value}})} />}</label>)}</fieldset>)}
 {(kind==='drops'||kind==='icon_packs')&&<label>{t('cover')}<input key={fileKey} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setFile(e.target.files?.[0]??null)} /><small>{t('coverHelp')}</small></label>}
 {kind!=='palettes'&&<label>{kind==='font_pairs'?t('link'):t('canva')}<input type="url" required={kind!=='font_pairs'} value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://" /></label>}
 {kind==='palettes'&&<label>{t('colors')}<input required value={colors} onChange={e=>setColors(e.target.value)} /></label>}
 {kind==='font_pairs'&&<><label>{t('headingFont')}<input required maxLength={150} value={heading} onChange={e=>setHeading(e.target.value)} /></label><label>{t('bodyFont')}<input required maxLength={150} value={body} onChange={e=>setBody(e.target.value)} /></label></>}
 <button disabled={busy} className="btn-primary">{t(busy?'publishing':'publish')}</button><p role="status">{message}</p></form></>
}
