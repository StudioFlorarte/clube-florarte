 'use client'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {createClient} from '@/lib/supabase/client'
import {locales,languageNames,type Locale} from '@/lib/i18n'
import {recoveryCopy} from '@/lib/recovery'
export default function ResetForm({locale,invalid}:{locale:Locale;invalid:boolean}){
 const t=recoveryCopy[locale],router=useRouter()
 const [email,setEmail]=useState(''),[busy,setBusy]=useState(false),[status,setStatus]=useState<'sent'|'error'|null>(null)
 async function send(e:React.FormEvent){e.preventDefault();if(busy)return;setBusy(true);setStatus(null);try{const {error}=await createClient().auth.resetPasswordForEmail(email.trim(),{redirectTo:`${window.location.origin}/set-password`});if(error)throw error;setStatus('sent')}catch{setStatus('error')}finally{setBusy(false)}}
 return <main className="auth-page" lang={locale}><section className="card form-card auth-card"><label className="language-picker language-native"><select aria-label="Language / Idioma" value={locale} onChange={e=>{document.cookie=`locale=${e.target.value};path=/;max-age=31536000;SameSite=Lax`;router.replace(`/reset-password?lang=${e.target.value}${invalid?'&error=invalid':''}`)}}>{locales.map(l=><option value={l} key={l}>{languageNames[l]}</option>)}</select></label><img className="auth-logo" src="/brand/clube-florarte-logo.png" alt="Clube Florarte"/><h1>{t.title}</h1><p>{t.intro}</p>{invalid&&<p role="alert">{t.invalid}</p>}<form className="stack" onSubmit={send}><label>{t.email}<input required type="email" autoComplete="email" maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} disabled={busy}/></label><button className="btn-primary" disabled={busy}>{busy?t.sending:t.send}</button><p role="status">{status?t[status]:''}</p></form><a href="/login">{t.login}</a></section></main>
}

