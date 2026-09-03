'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/app/language-provider'
import type { Key } from '@/lib/i18n'
export default function SidebarNav({ isAdmin, name, email, avatar }: { isAdmin: boolean; name: string; email: string; avatar?: string }) {
 const [photo,setPhoto]=useState(avatar)
 useEffect(()=>setPhoto(avatar),[avatar])
 useEffect(()=>{const update=(event:Event)=>setPhoto((event as CustomEvent<string>).detail);window.addEventListener('profile-avatar-updated',update);return()=>window.removeEventListener('profile-avatar-updated',update)},[])
 const path = usePathname(); const { t } = useLanguage()
 const links: [string, Key, string][] = [['/dashboard','drops','◆'],['/icons','icons','✦'],['/palettes','palettes','◐'],['/estrategia','strategy','✎'],['/feedback','feedback','♥']]
 return <aside className="sidebar"><Link className="brand" href="/dashboard"><span>Clube</span><strong>FLORARTE</strong></Link><nav>{links.map(([href,key,icon]) => <Link key={href} href={href} className={path.startsWith(href) ? 'active' : ''}><span aria-hidden>{icon}</span>{t(key)}</Link>)}{isAdmin && <Link href="/admin" className={path.startsWith('/admin') ? 'active admin-link' : 'admin-link'}>★ {t('admin')}</Link>}</nav><Link href="/profile" className="profile-link">{photo ? <img src={photo} alt="" className="avatar" /> : <span className="avatar initials">{name.charAt(0).toUpperCase()}</span>}<span><strong>{t('profile')}</strong><small>{email}</small></span><span aria-hidden>↗</span></Link></aside>
}
