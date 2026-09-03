'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadImage } from '@/lib/uploads'
import { useLanguage } from '@/app/language-provider'
import PasswordForm from '@/app/password-form'
import AvatarEditor from './avatar-editor'
export default function ProfileForm({ email, userId, profile, details, subscription }: any) {
 const {t,locale}=useLanguage();const router=useRouter()
 const [name,setName]=useState(profile?.display_name??'');const [phone,setPhone]=useState(details?.phone??'');const [instagram,setInstagram]=useState(details?.instagram??'')
 const [avatar,setAvatar]=useState(profile?.avatar_url??'');const [file,setFile]=useState<File|null>(null);const [preview,setPreview]=useState('')
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState('')
 useEffect(()=>{if(!file){setPreview('');return}const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url)},[file])
 async function save(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage('')
  try{const client=createClient();const avatar_url=file?await uploadImage(file,'avatars'):avatar
   const {error}=await client.from('profiles').update({display_name:name.trim(),avatar_url}).eq('id',userId).select('avatar_url').single();if(error)throw error
   setAvatar(avatar_url);setFile(null);window.dispatchEvent(new CustomEvent('profile-avatar-updated',{detail:avatar_url}));router.refresh()
   const {error:detailsError}=await client.from('account_details').upsert({id:userId,phone:phone.trim(),instagram:instagram.trim()});if(detailsError)throw detailsError
   setMessage(t('saved'))
  }catch{setMessage(t('error'))}finally{setBusy(false)}
 }
 const active=subscription&&new Date(subscription.current_period_end)>new Date()&&['active','cancelled'].includes(subscription.status)
 return <div className="profile-settings"><header className="settings-heading"><img className="section-brand-logo" src="/brand/clube-florarte-logo.png" alt="Clube Florarte"/><h1>{t('profile')}</h1><p>{t('profileIntro')}</p></header>
  <div className="profile-layout"><aside className="profile-overview"><section className="profile-identity card"><AvatarEditor avatar={preview||avatar} onChange={setFile} disabled={busy}/><h2>{name||t('profile')}</h2><p className="profile-email">{email}</p>{file&&<p className="photo-pending">{t('photoPending')}</p>}</section>
   <section className="membership-section" aria-label={t('subscription')}><h2>{t('subscription')}</h2><div className="membership-card"><span>{profile?.is_admin?t('adminAccess'):active?t('expires'):t('inactive')}</span>{!profile?.is_admin&&active&&<time dateTime={subscription.current_period_end}>{new Date(subscription.current_period_end).toLocaleDateString(locale,{day:'2-digit',month:'long',year:'numeric',timeZone:'America/Sao_Paulo'})}</time>}<img className="membership-flower" src="/brand/lirio.png" alt="" aria-hidden="true"/></div></section>
  </aside><div className="profile-panels"><form className="settings-panel card" onSubmit={save}><div className="settings-section-title"><span aria-hidden="true">♡</span><div><h2>{t('personalDetails')}</h2><p>{t('personalDetailsHelp')}</p></div></div><fieldset disabled={busy} className="profile-fields"><label>{t('name')}<input value={name} autoComplete="name" maxLength={100} required onChange={e=>setName(e.target.value)}/></label><label>{t('email')}<input type="email" value={email} readOnly/></label><label>{t('phone')}<input type="tel" autoComplete="tel" maxLength={30} value={phone} onChange={e=>setPhone(e.target.value)}/></label><label>{t('instagram')}<input value={instagram} maxLength={200} placeholder="@" onChange={e=>setInstagram(e.target.value)}/><small>{t('instagramHelp')}</small></label></fieldset><div className="profile-save"><p role="status">{message}</p><button className="btn-primary" disabled={busy}>{t(busy?'saving':'save')}</button></div></form>
   <details className="settings-panel password-panel card"><summary><span className="settings-section-title"><span aria-hidden="true">⌑</span><span><strong>{t('newPassword')}</strong><small>{t('passwordSectionHelp')}</small></span></span><span className="settings-chevron" aria-hidden="true">⌄</span></summary><PasswordForm/></details>
   <button className="profile-logout" disabled={busy} onClick={async()=>{const {error}=await createClient().auth.signOut();if(error){setMessage(t('error'));return}router.replace('/login');router.refresh()}}><span aria-hidden="true">↪</span>{t('logout')}</button>
  </div></div>
 </div>
}
