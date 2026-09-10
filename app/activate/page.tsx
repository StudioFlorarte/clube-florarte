import type {Metadata} from 'next'
import {validLocale} from '@/lib/i18n'
import {isAuthTokenHash,recoveryCopy} from '@/lib/recovery'
export const dynamic='force-dynamic'
export const metadata:Metadata={title:'Clube Florarte',robots:{index:false,follow:false},referrer:'strict-origin'}
// Do not consume single-use tokens on GET: email scanners may open these links.
export default function Activate({searchParams}:{searchParams:{token_hash?:string;type?:string;lang?:string}}){
 const locale=validLocale(searchParams.lang),t=recoveryCopy[locale],token=searchParams.token_hash||'',type=searchParams.type||''
 const valid=isAuthTokenHash(token)&&['invite','recovery'].includes(type)
 return <main className="auth-page" lang={locale}><section className="card form-card auth-card"><img className="auth-logo" src="/brand/clube-florarte-logo.png" alt="Clube Florarte"/><h1>{t.title}</h1><p>{valid?t.confirm:t.invalid}</p>{valid&&<form method="post" action="/auth/confirm"><input type="hidden" name="token_hash" value={token}/><input type="hidden" name="type" value={type}/><input type="hidden" name="lang" value={locale}/><button className="btn-primary">{t.continue}</button></form>}<p><a href={`/reset-password?lang=${locale}`}>{t.again}</a></p></section></main>
}

