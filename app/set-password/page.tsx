import { createClient } from '@/lib/supabase/server'
import { getT } from '@/lib/locale-server'
import PasswordForm from '../password-form'
import { LanguageSelect } from '../language-provider'
import Link from 'next/link'
export default async function SetPasswordPage() {
  const t = getT(); const { data: { user } } = await createClient().auth.getUser()
  return <main className="auth-page"><div className="card form-card auth-card"><LanguageSelect /><h1>{t('setPassword')}</h1>{user ? <PasswordForm onboarding /> : <><p>{t('invalidInvite')}</p><Link href="/login">{t('login')}</Link></>}</div></main>
}
