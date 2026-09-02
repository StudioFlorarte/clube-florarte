import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarNav from './sidebar-nav'

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarNav isAdmin={!!profile?.is_admin} displayName={profile?.display_name ?? user.email ?? ''} />
      <main style={{ flex: 1, padding: '40px 48px', maxWidth: 1100 }}>{children}</main>

      <a
        href="https://wa.me/SEUNUMEROAQUI"
        target="_blank"
        rel="noreferrer"
        style={{
          position: 'fixed',
          right: 28,
          bottom: 28,
          background: '#25D366',
          color: 'white',
          borderRadius: 999,
          padding: '14px 22px',
          fontWeight: 600,
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          textDecoration: 'none',
        }}
      >
        Falar no WhatsApp
      </a>
    </div>
  )
}
