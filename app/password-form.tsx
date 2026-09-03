'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from './language-provider'
import { useRouter } from 'next/navigation'
export default function PasswordForm({ onboarding = false }: { onboarding?: boolean }) {
  const { t } = useLanguage(); const router = useRouter()
  const [password, setPassword] = useState(''); const [confirm, setConfirm] = useState(''); const [show, setShow] = useState(false); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('')
  async function save(e: React.FormEvent) {
    e.preventDefault(); if (password !== confirm) { setMessage(t('passwordMismatch')); return }
    setBusy(true); setMessage('')
    try { const { error } = await createClient().auth.updateUser({ password }); if (error) throw error
      setPassword(''); setConfirm(''); setMessage(t('saved')); if (onboarding) { router.replace('/dashboard'); router.refresh() }
    } catch { setMessage(t('error')) } finally { setBusy(false) }
  }
  return <form onSubmit={save} className="stack"><label>{t('newPassword')}<input required minLength={12} maxLength={128} autoComplete="new-password" type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} /></label>
    <label>{t('confirmPassword')}<input required minLength={12} maxLength={128} autoComplete="new-password" type={show ? 'text' : 'password'} value={confirm} onChange={e => setConfirm(e.target.value)} /></label>
    <button type="button" className="text-button" aria-pressed={show} onClick={() => setShow(!show)}>{t(show ? 'hide' : 'show')}</button><small>{t('passwordHelp')}</small>
    <button className="btn-primary" disabled={busy}>{t(busy ? 'saving' : 'setPassword')}</button><p role="status">{message}</p></form>
}
