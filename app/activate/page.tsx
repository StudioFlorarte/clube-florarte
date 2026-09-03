import type { Metadata } from 'next'
export const dynamic = 'force-dynamic'
// Native form POSTs under no-referrer send Origin: null and fail our CSRF check.
// strict-origin keeps the real origin while omitting the path and private token.
export const metadata: Metadata = { title:'Clube Florarte', robots:{index:false,follow:false}, referrer:'strict-origin' }

// GET only renders a confirmation button. Email scanners must not consume the OTP.
export default function Activate({searchParams}:{searchParams:{token_hash?:string;type?:string;lang?:string}}) {
 const en=searchParams.lang==='en'
 const token=searchParams.token_hash||''
 const type=searchParams.type||''
 const valid=/^[a-f0-9]{32,128}$/i.test(token)&&['invite','recovery'].includes(type)
 return <main style={{minHeight:'100vh',display:'grid',placeItems:'center',padding:24,background:'#fff5eb',color:'#75434b'}}>
  <section style={{width:'100%',maxWidth:480,padding:36,borderRadius:28,background:'#fffdfb',textAlign:'center'}} lang={en?'en':'pt-BR'}>
   <img src="/brand/clube-florarte-logo.png" alt="Clube Florarte" style={{display:'block',width:'min(280px,90%)',height:'auto',margin:'0 auto 24px'}}/>
   <h1 style={{fontSize:28}}>{en?'Welcome to your creative space':'Seu espaço criativo espera por você'}</h1>
   <p>{valid?(en?'Continue to create your personal password.':'Continue para criar sua senha pessoal.'):(en?'This link is invalid. Please contact us for help.':'Este link é inválido. Fale conosco para receber ajuda.')}</p>
   {valid&&<form method="post" action="/auth/confirm">
    <input type="hidden" name="token_hash" value={token}/><input type="hidden" name="type" value={type}/><input type="hidden" name="lang" value={en?'en':'pt'}/>
    <button style={{padding:'14px 24px',border:0,borderRadius:28,background:'#c6134d',color:'white',fontSize:17,cursor:'pointer'}}>{en?'Create my password':'Criar minha senha'}</button>
   </form>}
   <p style={{fontSize:14,marginTop:28}}><a href="mailto:hello@studioflorarte.com">hello@studioflorarte.com</a></p>
  </section>
 </main>
}
