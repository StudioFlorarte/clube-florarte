'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/app/language-provider'
import { createClient } from '@/lib/supabase/client'
import { locales, languageNames, type Locale } from '@/lib/i18n'
import { communityText, fileTypes, type Attachment } from '@/lib/community'
export default function FeedComposer() {
  const { locale } = useLanguage(), router = useRouter(), t = (key: Parameters<typeof communityText>[1]) => communityText(locale, key)
  const [language, setLanguage] = useState<Locale>(locale), [body, setBody] = useState(''), [files, setFiles] = useState<File[]>([]), [alts, setAlts] = useState<string[]>([]), [busy, setBusy] = useState(false), [message, setMessage] = useState('')
  const input = useRef<HTMLInputElement>(null)
  useEffect(() => setLanguage(locale), [locale])
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (busy || (!body.trim() && !files.length)) return
    setBusy(true); setMessage(''); const client = createClient(), uploaded: string[] = []
    let saved = false
    try {
      if (files.length > 10 || files.some(f => !fileTypes[f.type] || f.size > 50 * 1024 * 1024 || !f.size)) throw Error('invalid')
      const { data: { user } } = await client.auth.getUser(); if (!user) throw Error()
      const attachments: Attachment[] = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i], path = `${user.id}/${crypto.randomUUID()}.${fileTypes[file.type]}`
        const { error } = await client.storage.from('feed-assets').upload(path, file, { contentType: file.type, upsert: false })
        if (error) throw error
        uploaded.push(path); attachments.push({ path, name: file.name, type: file.type, size: file.size, alt: alts[i]?.trim() || '' })
      }
      const { error } = await client.from('feed_posts').insert({ author_id: user.id, locale: language, body: body.trim(), attachments, published: true })
      if (error) throw error
      saved = true; setBody(''); setFiles([]); setAlts([]); if (input.current) input.current.value = ''
      setMessage(`${t('published')} ${languageNames[language]}`); router.refresh(); window.dispatchEvent(new Event('club-content-updated'))
    } catch (err) {
      if (!saved && uploaded.length) await client.storage.from('feed-assets').remove(uploaded)
      setMessage(t(err instanceof Error && err.message === 'invalid' ? 'invalid' : 'error'))
    } finally { setBusy(false) }
  }
  return <form className="feed-composer card" onSubmit={submit}>
    <div className="composer-heading"><img src="/brand/lirio.png" alt=""/><label>{t('publishIn')}<select disabled={busy} value={language} onChange={e => setLanguage(e.target.value as Locale)}>{locales.map(l => <option key={l} value={l}>{languageNames[l]}</option>)}</select></label></div>
    <p className="composer-help">{t('separate')}</p>
    <label className="sr-only" htmlFor="feed-body">{t('write')}</label><textarea id="feed-body" rows={4} maxLength={12000} disabled={busy} placeholder={t('write')} value={body} onChange={e => setBody(e.target.value)}/>
    <label className="feed-upload">{t('attach')}<input ref={input} type="file" multiple disabled={busy} accept={Object.keys(fileTypes).join(',')} onChange={e => { const next = Array.from(e.target.files || []); setFiles(next); setAlts(next.map(() => '')); setMessage(next.length > 10 || next.some(f => !fileTypes[f.type] || f.size > 50 * 1024 * 1024) ? t('invalid') : '') }}/></label>
    <small>{t('limits')}</small>
    {files.map((file, i) => <div className="attachment-draft" key={`${file.name}-${i}`}><span>{file.name}</span>{file.type.startsWith('image/') && <label>{t('alt')}<input maxLength={300} disabled={busy} value={alts[i] || ''} onChange={e => setAlts(alts.map((a, j) => j === i ? e.target.value : a))}/></label>}<button type="button" disabled={busy} className="text-button" onClick={() => { setFiles(files.filter((_, j) => j !== i)); setAlts(alts.filter((_, j) => j !== i)) }}>{t('remove')}</button></div>)}
    <div className="composer-footer"><p role="status">{message}</p><button className="btn-primary" disabled={busy || (!body.trim() && !files.length) || files.length > 10}>{t(busy ? 'publishing' : 'publish')}</button></div>
  </form>
}
