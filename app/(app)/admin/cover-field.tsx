'use client'
import { useEffect, useState } from 'react'
import { useLanguage } from '@/app/language-provider'

export default function CoverField({label,file,onFile,position,onPosition,current,shape}:{label:string;file:File|null;onFile:(file:File|null)=>void;position:string;onPosition:(value:string)=>void;current?:string|null;shape:'card'|'detail'}) {
  const {t}=useLanguage()
  const [preview,setPreview]=useState<string|null>(current??null)
  const [x,y]=position.split(' ').map(value=>Number.parseInt(value)||50)
  useEffect(()=>{if(!file){setPreview(current??null);return}const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url)},[file,current])
  const set=(nextX:number,nextY:number)=>onPosition(`${nextX}% ${nextY}%`)
  return <fieldset className="cover-editor"><legend>{label}</legend><div className={`cover-editor-preview ${shape}`}>{preview&&<img src={preview} alt="" style={{objectPosition:position}}/>}</div><label>{t('chooseCover')}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>onFile(e.target.files?.[0]??null)}/></label><div className="cover-position-controls"><label>{t('horizontal')}<input type="range" min="0" max="100" value={x} onChange={e=>set(Number(e.target.value),y)}/></label><label>{t('vertical')}<input type="range" min="0" max="100" value={y} onChange={e=>set(x,Number(e.target.value))}/></label></div><small>{t('coverAdjustHelp')}</small></fieldset>
}
