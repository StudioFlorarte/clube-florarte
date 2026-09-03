'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/app/language-provider'
type Comment = { id: string; body: string; created_at: string; author_name: string }
export default function CommentSection({ dropId }: { dropId: string }) {
 const {t,locale}=useLanguage(); const [comments,setComments]=useState<Comment[]>([]); const [body,setBody]=useState(''); const [busy,setBusy]=useState(false); const [error,setError]=useState(false); const [loaded,setLoaded]=useState(false)
 async function load() { const {data,error}=await createClient().from('comments').select('id,body,created_at,author_name').eq('drop_id',dropId).order('created_at',{ascending:false}); if(error) {setError(true);return};setComments(data??[]);setLoaded(true) }
 useEffect(()=>{load()},[dropId])
 async function submit(e:React.FormEvent) { e.preventDefault(); if(!body.trim()||busy)return;setBusy(true);setError(false);try{ const client=createClient();const {data:{user}}=await client.auth.getUser();if(!user)throw Error();const {error}=await client.from('comments').insert({drop_id:dropId,author_id:user.id,body:body.trim()});if(error)throw error;setBody('');await load() }catch{setError(true)}finally{setBusy(false)} }
 return <><form onSubmit={submit} className="card comment-form"><label className="sr-only" htmlFor="comment">{t('comment')}</label><textarea id="comment" required maxLength={3000} rows={3} value={body} placeholder={t('comment')} onChange={e=>setBody(e.target.value)} /><button className="btn-primary" disabled={busy||!body.trim()}>{t(busy?'publishing':'publish')}</button></form>{error&&<p role="alert">{t('error')}</p>}{comments.map(c=><article className="card comment-item" key={c.id}><header><strong>{c.author_name||t('member')}</strong><time dateTime={c.created_at}>{new Date(c.created_at).toLocaleDateString(locale)}</time></header><p>{c.body}</p></article>)}{loaded&&!comments.length&&<p>{t('firstComment')}</p>}</>
}
