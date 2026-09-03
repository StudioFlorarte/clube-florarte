'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/app/language-provider'
import type { Key } from '@/lib/i18n'
export default function SidebarNav({ isAdmin, name, email, avatar }: { isAdmin: boolean; name: string; email: string; avatar?: string }) {
 const [photo,setPhoto]=useState(avatar)
 const [menuOpen,setMenuOpen]=useState(false)
 useEffect(()=>setPhoto(avatar),[avatar])
 useEffect(()=>{const update=(event:Event)=>setPhoto((event as CustomEvent<string>).detail);window.addEventListener('profile-avatar-updated',update);return()=>window.removeEventListener('profile-avatar-updated',update)},[])
 const path = usePathname(); const { t } = useLanguage()
 const links: [string, Key, string][] = [['/dashboard','drops','◆'],['/icons','icons','✦'],['/palettes','palettes','◐'],['/estrategia','strategy','✎'],['/services','services','✿'],['/feedback','feedback','♥']]
 return <aside className="sidebar"><Link className="brand" href="/dashboard" aria-label="Clube Florarte"><img src="/brand/clube-florarte-logo.png" alt="Clube Florarte" /></Link><div className="mobile-profile"><span className="mobile-avatar" aria-hidden>{photo ? <img src={photo} alt="" className="avatar" /> : <span className="avatar initials">{name.charAt(0).toUpperCase()}</span>}</span><Link className="settings-link" href="/profile" aria-label={t('profile')}><svg viewBox="0 0 24 24" aria-hidden><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1 1.55V21h-4v-.08a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3v-4h.08a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3h4v.08a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.55 1H21v4h-.08a1.7 1.7 0 0 0-1.52 1Z"/></svg></Link><button className="menu-toggle" type="button" aria-label="Menu" aria-expanded={menuOpen} onClick={()=>setMenuOpen(v=>!v)}><span/><span/><span/></button></div><nav className={menuOpen?'mobile-open':''}>{links.map(([href,key,icon]) => <Link onClick={()=>setMenuOpen(false)} key={href} href={href} className={path.startsWith(href) ? 'active' : ''}><span aria-hidden>{icon}</span>{t(key)}</Link>)}{isAdmin && <Link onClick={()=>setMenuOpen(false)} href="/admin" className={path.startsWith('/admin') ? 'active admin-link' : 'admin-link'}>★ {t('admin')}</Link>}</nav><Link href="/profile" className="profile-link">{photo ? <img src={photo} alt="" className="avatar" /> : <span className="avatar initials">{name.charAt(0).toUpperCase()}</span>}<span><strong>{t('profile')}</strong><small>{email}</small></span><span aria-hidden>↗</span></Link></aside>
}
