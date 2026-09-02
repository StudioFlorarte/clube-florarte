import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarNav from './sidebar-nav'
import TopBar from './top-bar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin, display_name')
    .eq('id', user.id)
    .single()

  const name = profile?.display_name ?? user.email ?? ''

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <SidebarNav isAdmin={!!profile?.is_admin} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <TopBar name={name} />
        <main style={{ flex: 1, padding: '36px 48px 60px', maxWidth: 1140 }}>{children}</main>
      </div>

      <a
        href="https://wa.me/SEUNUMEROAQUI"
        target="_blank"
        rel="noreferrer"
        style={{
          position: 'fixed',
          right: 28,
          bottom: 28,
          background: 'linear-gradient(90deg, #25D366, #1EBE5A)',
          color: 'white',
          borderRadius: 999,
          padding: '14px 22px',
          fontWeight: 600,
          boxShadow: '0 10px 24px rgba(0,0,0,0.18)',
          textDecoration: 'none',
        }}
      >
        Falar no WhatsApp
      </a>
    </div>
  )
}
