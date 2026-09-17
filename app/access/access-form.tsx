'use client';
import {useState} from 'react';

const copy={
  pt:{title:'Crie seu acesso ao Clube Florarte',intro:'Use o mesmo email informado na compra pelo Stripe. Enviaremos um link para confirmar que esse email é seu e criar sua senha.',email:'Email da compra',button:'Enviar link de acesso',busy:'Enviando…',sent:'Se houver uma assinatura ativa para esse email, você receberá o link de acesso. Confira também o spam.',error:'Não foi possível processar agora. Aguarde alguns minutos e tente novamente.',login:'Já tenho senha · Entrar'},
  en:{title:'Create your Florarte Club access',intro:'Use the same email address you entered at Stripe checkout. We will send a link to verify your email and create your password.',email:'Checkout email',button:'Send access link',busy:'Sending…',sent:'If there is an active subscription for this email, you will receive an access link. Please check spam too.',error:'We could not process this request right now. Please wait a few minutes and try again.',login:'I have a password · Sign in'},
} as const;
export default function AccessForm({initialLocale}:{initialLocale:'pt'|'en'}){
  const [locale,setLocale]=useState(initialLocale),[email,setEmail]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState<'sent'|'error'|null>(null);
  const t=copy[locale];
  async function submit(event:React.FormEvent){event.preventDefault();if(busy)return;setBusy(true);setMessage(null);
    try{const response=await fetch('/api/access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,locale})});setMessage(response.ok?'sent':'error');}
    catch{setMessage('error');}finally{setBusy(false);}
  }
  return <main className="auth-page" lang={locale}><section className="card form-card auth-card">
    <label className="language-picker language-native"><select aria-label="Language / Idioma" value={locale} onChange={event=>setLocale(event.target.value as 'pt'|'en')}><option value="pt">Português</option><option value="en">English</option></select></label>
    <img className="auth-logo" src="/brand/clube-florarte-logo.png" alt="Clube Florarte"/><h1>{t.title}</h1><p>{t.intro}</p>
    <form className="stack" onSubmit={submit}><label>{t.email}<input required type="email" autoComplete="email" maxLength={254} value={email} onChange={event=>setEmail(event.target.value)} disabled={busy}/></label><button className="btn-primary" disabled={busy}>{busy?t.busy:t.button}</button><p role="status">{message?t[message]:''}</p></form>
    <a href="/login">{t.login}</a>
  </section></main>;
}

