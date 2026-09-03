'use client'
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/app/language-provider'

export default function AvatarEditor({avatar,onChange,disabled}:{avatar:string;onChange:(file:File)=>void;disabled:boolean}) {
 const {t}=useLanguage(); const input=useRef<HTMLInputElement>(null); const dialog=useRef<HTMLDialogElement>(null)
 const [source,setSource]=useState(''); const [size,setSize]=useState({w:0,h:0}); const [zoom,setZoom]=useState(1)
 const [position,setPosition]=useState({x:0,y:0}); const [error,setError]=useState(''); const [working,setWorking]=useState(false)
 const image=useRef<HTMLImageElement|null>(null); const drag=useRef<{x:number;y:number}|null>(null)
 useEffect(()=>()=>{if(source)URL.revokeObjectURL(source)},[source])
 useEffect(()=>{if(source){dialog.current?.showModal()}},[source])
 const crop=Math.min(size.w,size.h)/zoom
 const sx=(size.w-crop)*(position.x+1)/2; const sy=(size.h-crop)*(position.y+1)/2
 function close(){dialog.current?.close();setSource('');image.current=null;input.current?.focus()}
 async function choose(file?:File){
  if(!file)return
  setError('')
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){setError(t('coverHelp'));return}
  const url=URL.createObjectURL(file);const img=new Image()
  img.onload=()=>{image.current=img;setSize({w:img.naturalWidth,h:img.naturalHeight});setZoom(1);setPosition({x:0,y:0});setSource(url)}
  img.onerror=()=>{URL.revokeObjectURL(url);setError(t('error'))};img.src=url
 }
 async function apply(){
  if(!image.current||!crop)return
  setWorking(true)
  try{const canvas=document.createElement('canvas');canvas.width=640;canvas.height=640
   const ctx=canvas.getContext('2d');if(!ctx)throw Error()
   ctx.fillStyle='#fff8ee';ctx.fillRect(0,0,640,640);ctx.drawImage(image.current,sx,sy,crop,crop,0,0,640,640)
   const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error()),'image/jpeg',.92))
   onChange(new File([blob],'profile.jpg',{type:'image/jpeg'}));close()
  }catch{setError(t('error'))}finally{setWorking(false)}
 }
 return <div className="photo-editor">
  <div className="profile-photo-ring"><div className="profile-photo">{avatar?<img src={avatar} alt={t('photo')}/>:<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="17" r="8"/><path d="M9 41c0-10 6-15 15-15s15 5 15 15"/></svg>}</div><button className="photo-edit-button" type="button" disabled={disabled} aria-label={t('changePhoto')} onClick={()=>input.current?.click()}>✎</button></div>
  <input ref={input} className="sr-only" aria-label={t('choosePhoto')} type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled} onChange={e=>{void choose(e.target.files?.[0]);e.target.value=''}}/>
  <button className="photo-upload" type="button" disabled={disabled} onClick={()=>input.current?.click()}>{t(avatar?'changePhoto':'choosePhoto')}</button><small>{t('coverHelp')}</small>
  {error&&<p role="alert">{error}</p>}
  <dialog className="crop-dialog" ref={dialog} onCancel={e=>{e.preventDefault();if(!working)close()}} aria-labelledby="crop-title">
   <div className="crop-heading"><h2 id="crop-title">{t('cropPhoto')}</h2><button type="button" className="icon-close" disabled={working} aria-label={t('cancel')} onClick={close}>×</button></div><p>{t('cropHelp')}</p>
   <div className="crop-stage" onPointerDown={e=>{drag.current={x:e.clientX,y:e.clientY};e.currentTarget.setPointerCapture(e.pointerId)}} onPointerUp={()=>{drag.current=null}} onLostPointerCapture={()=>{drag.current=null}} onPointerMove={e=>{if(!drag.current||!crop)return;const dx=e.clientX-drag.current.x,dy=e.clientY-drag.current.y;drag.current={x:e.clientX,y:e.clientY};const width=e.currentTarget.clientWidth;setPosition(p=>({x:Math.max(-1,Math.min(1,p.x-(size.w>crop?dx/width*2/(size.w/crop-1):0))),y:Math.max(-1,Math.min(1,p.y-(size.h>crop?dy/width*2/(size.h/crop-1):0)))}))}}>
    {source&&crop>0&&<img draggable={false} alt="" src={source} style={{width:`${size.w/crop*100}%`,height:`${size.h/crop*100}%`,left:`${-sx/crop*100}%`,top:`${-sy/crop*100}%`}}/>}<div className="crop-mask"/>
   </div>
   <label>{t('zoom')}<input type="range" min="1" max="3" step=".01" value={zoom} onChange={e=>setZoom(Number(e.target.value))}/></label>
   <details className="crop-adjust"><summary>{t('fineTune')}</summary><label>{t('horizontal')}<input type="range" min="-1" max="1" step=".01" value={position.x} onChange={e=>setPosition(p=>({...p,x:Number(e.target.value)}))}/></label><label>{t('vertical')}<input type="range" min="-1" max="1" step=".01" value={position.y} onChange={e=>setPosition(p=>({...p,y:Number(e.target.value)}))}/></label></details>
   <div className="crop-actions"><button className="btn-secondary" type="button" disabled={working} onClick={close}>{t('cancel')}</button><button className="btn-primary" type="button" disabled={working} onClick={apply}>{t('usePhoto')}</button></div>
  </dialog>
 </div>
}
