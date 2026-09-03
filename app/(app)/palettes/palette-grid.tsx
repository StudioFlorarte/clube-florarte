'use client'
import { useState } from 'react'
import { useLanguage } from '@/app/language-provider'
import { localized } from '@/lib/i18n'
export default function PaletteGrid({palettes}:{palettes:any[]}){const {locale,t}=useLanguage();const [message,setMessage]=useState('');return <><div className="resource-grid">{palettes.map(p=><article className="card drop-card" key={p.id}><div className="swatches">{p.colors.map((color:string)=><button key={color} style={{background:color}} aria-label={color} title={color} onClick={async()=>{try{await navigator.clipboard.writeText(color);setMessage(`${t('copied')}: ${color}`)}catch{setMessage(t('error'))}}}/>)}</div><div className="card-content"><h2>{localized(p,'title',locale)}</h2><p>{localized(p,'description',locale)}</p><small>{p.colors.join(' · ')}</small></div></article>)}</div><p role="status">{message}</p></>}
