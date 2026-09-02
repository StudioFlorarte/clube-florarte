'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const links = [
  { href: '/dashboard', label: 'Drops' },
  { href: '/icons', label: 'Ícones' },
  { href: '/palettes', label: 'Paletas & Fontes' },
  { href: '/estrategia', label: 'Estratégia de Conteúdo' },
  { href: '/feedback', label: 'Feedback' },
]

export default function SidebarNav({ isAdmin, displayName }: { isAdmin: boolean; displayName: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      style={{
        width: 240,
        background: 'var(--wine)',
        color: 'white',
        padding: '32px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <p style={{ fontFamily: 'var(--font-script)', fontSize: 26, margin: '0 0 32px' }}>Clube Florarte</p>

      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 500,
            background: pathname.startsWith(link.href) ? 'rgba(255,255,255,0.15)' : 'transparent',
            textDecoration: 'none',
            color: 'white',
          }}
        >
          {link.label}
        </Link>
      ))}

      {isAdmin && (
        <Link
          href="/admin"
          style={{
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 500,
            marginTop: 12,
            background: pathname.startsWith('/admin') ? 'rgba(255,255,255,0.15)' : 'rgba(255,213,91,0.2)',
            textDecoration: 'none',
            color: 'var(--yellow)',
          }}
        >
          ★ Painel admin
        </Link>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 24, fontSize: 13, opacity: 0.85 }}>
        <p style={{ marginBottom: 8 }}>{displayName}</p>
        <button
          onClick={handleLogout}
          style={{ background: 'none', border: 'none', color: 'white', textDecoration: 'underline', padding: 0, fontSize: 13 }}
        >
          Sair
        </button>
      </div>
    </aside>
  )
}
