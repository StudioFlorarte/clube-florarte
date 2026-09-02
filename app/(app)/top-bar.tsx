'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function TopBar({ name }: { name: string }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 18,
        padding: '20px 48px 0',
      }}
    >
      <span style={{ fontSize: 14, color: 'var(--ink-soft)' }}>{name}</span>
      <button
        onClick={handleLogout}
        className="btn-secondary"
        style={{ padding: '8px 18px', fontSize: 13 }}
      >
        Sair
      </button>
    </header>
  )
}
