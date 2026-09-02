'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Drops', icon: '◆' },
  { href: '/icons', label: 'Ícones', icon: '✦' },
  { href: '/palettes', label: 'Paletas & Fontes', icon: '◐' },
  { href: '/estrategia', label: 'Estratégia', icon: '✎' },
  { href: '/feedback', label: 'Feedback', icon: '♥' },
]

export default function SidebarNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()

  return (
    <aside
      style={{
        width: 250,
        background: 'linear-gradient(180deg, var(--wine), #7A0A2E)',
        color: 'white',
        padding: '36px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }}
      />
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: -80,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255,213,91,0.08)',
        }}
      />

      <p style={{ fontFamily: 'var(--font-script)', fontSize: 30, margin: '0 0 2px', position: 'relative' }}>
        Clube
      </p>
      <p style={{ fontSize: 13, letterSpacing: 3, opacity: 0.75, margin: '0 0 36px', position: 'relative' }}>
        FLORARTE
      </p>

      {links.map((link) => {
        const active = pathname.startsWith(link.href)
        return (
          <Link
            key={link.href}
            href={link.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '11px 16px',
              borderRadius: 14,
              fontSize: 15,
              fontWeight: 500,
              background: active ? 'rgba(255,255,255,0.16)' : 'transparent',
              textDecoration: 'none',
              color: 'white',
              position: 'relative',
            }}
          >
            <span style={{ fontSize: 13, opacity: 0.85 }}>{link.icon}</span>
            {link.label}
          </Link>
        )
      })}

      {isAdmin && (
        <Link
          href="/admin"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '11px 16px',
            borderRadius: 14,
            fontSize: 15,
            fontWeight: 600,
            marginTop: 14,
            background: pathname.startsWith('/admin') ? 'rgba(255,213,91,0.3)' : 'rgba(255,213,91,0.15)',
            textDecoration: 'none',
            color: 'var(--yellow)',
            position: 'relative',
          }}
        >
          ★ Painel admin
        </Link>
      )}
    </aside>
  )
}
