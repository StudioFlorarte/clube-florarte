'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadImage } from '@/lib/uploads'
import { useLanguage } from '@/app/language-provider'
import PasswordForm from '@/app/password-form'
export default function ProfileForm({ email, userId, profile, details, subscription }: any) {
  const { t, locale } = useLanguage(); const router = useRouter()
  const [name, setName] = useState(profile?.display_name ?? '')
  const [phone, setPhone] = useState(details?.phone ?? '')
  const [instagram, setInstagram] = useState(details?.instagram ?? '')
  const [avatar, setAvatar] = useState(profile?.avatar_url ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState('')
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMessage('')
    try {
      const client = createClient()
      const avatar_url = file ? await uploadImage(file, 'avatars') : avatar
      const { error } = await client.from('profiles').update({ display_name: name.trim(), avatar_url }).eq('id', userId)
      if (error) throw error
      const { error: detailsError } = await client.from('account_details').upsert({ id: userId, phone: phone.trim(), instagram: instagram.trim() })
      if (detailsError) throw detailsError
      setAvatar(avatar_url); setFile(null); setMessage(t('saved')); router.refresh()
    } catch { setMessage(t('error')) } finally { setBusy(false) }
  }
  return <div className="narrow"><h1>{t('profile')}</h1><form className="card form-card" onSubmit={save}>
    {avatar && <img className="avatar large" src={avatar} alt={t('photo')} />}
    <label>{t('photo')}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setFile(e.target.files?.[0] ?? null)} /><small>{t('coverHelp')}</small></label>
    <label>{t('name')}<input value={name} maxLength={100} required onChange={e => setName(e.target.value)} /></label>
    <label>{t('email')}<input type="email" value={email} readOnly /></label>
    <label>{t('phone')}<input type="tel" autoComplete="tel" maxLength={30} value={phone} onChange={e => setPhone(e.target.value)} /></label>
    <label>{t('instagram')}<input value={instagram} maxLength={200} onChange={e => setInstagram(e.target.value)} /><small>{t('instagramHelp')}</small></label>
    <button className="btn-primary" disabled={busy}>{t(busy ? 'saving' : 'save')}</button><p role="status">{message}</p>
  </form><section className="card form-card"><h2>{t('subscription')}</h2><p>{profile?.is_admin ? t('adminAccess') : subscription && new Date(subscription.current_period_end) > new Date() && ['active','cancelled'].includes(subscription.status) ? `${t('expires')}: ${new Date(subscription.current_period_end).toLocaleDateString(locale)}` : t('inactive')}</p></section>
  <section className="card form-card"><h2>{t('newPassword')}</h2><PasswordForm /></section>
  <button className="btn-secondary" onClick={async () => { const { error } = await createClient().auth.signOut(); if (error) { setMessage(t('error')); return }; router.replace('/login'); router.refresh() }}>{t('logout')}</button></div>
}
