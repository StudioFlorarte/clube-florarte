import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NewDropForm from './new-drop-form'

export default async function AdminPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/dashboard')

  const { count: memberCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { data: drops } = await supabase
    .from('drops')
    .select('id, title, category, created_at')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 style={{ fontSize: 32 }}>Painel admin</h1>

      <div className="card" style={{ padding: '20px 24px', display: 'inline-block', marginTop: 20 }}>
        <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Total de membros</p>
        <p style={{ fontSize: 36, fontWeight: 700, color: 'var(--wine)' }}>{memberCount ?? 0}</p>
      </div>

      <h2 style={{ fontSize: 22, marginTop: 40, marginBottom: 12 }}>Publicar novo drop</h2>
      <NewDropForm />

      <h2 style={{ fontSize: 22, marginTop: 48, marginBottom: 12 }}>Drops publicados</h2>
      <div className="card" style={{ padding: 8 }}>
        {(drops ?? []).map((d) => (
          <div key={d.id} style={{ padding: '12px 16px', borderBottom: '1px solid #F1E4CC' }}>
            <strong>{d.title}</strong> <span style={{ color: 'var(--ink-soft)', fontSize: 13 }}>· {d.category}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
