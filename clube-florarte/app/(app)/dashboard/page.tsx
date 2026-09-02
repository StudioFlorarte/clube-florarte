import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: drops } = await supabase
    .from('drops')
    .select('id, title, cover_url, category, description, created_at')
    .order('created_at', { ascending: false })

  const isNew = (createdAt: string) => (Date.now() - new Date(createdAt).getTime()) / 86400000 <= 30

  return (
    <div>
      <div className="hero-banner">
        <p style={{ fontFamily: 'var(--font-script)', fontSize: 24, opacity: 0.9, margin: 0 }}>seus drops</p>
        <h1 style={{ fontSize: 34, color: 'white', marginTop: 4 }}>Biblioteca de templates</h1>
        <p style={{ maxWidth: 460, marginTop: 10, opacity: 0.92, lineHeight: 1.5 }}>
          Cada drop é uma coleção completa no Canva. Abra, faça uma cópia e deixe com a cara da sua marca.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 22,
          marginTop: 32,
        }}
      >
        {(drops ?? []).map((drop) => (
          <Link
            key={drop.id}
            href={`/drops/${drop.id}`}
            className="card"
            style={{ display: 'block', overflow: 'hidden', textDecoration: 'none', color: 'inherit' }}
          >
            <div
              style={{
                height: 130,
                background: drop.cover_url
                  ? `url(${drop.cover_url}) center/cover`
                  : 'linear-gradient(135deg, #FCEFDD, #FBE0D6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {!drop.cover_url && (
                <span style={{ fontSize: 34, opacity: 0.5 }}>✦</span>
              )}
            </div>
            <div style={{ padding: '18px 20px' }}>
              <span className="badge">{drop.category ?? 'Feed'}</span>
              {isNew(drop.created_at) && (
                <span className="badge" style={{ background: 'var(--pink)', color: 'white', marginLeft: 6 }}>
                  Novo
                </span>
              )}
              <h3 style={{ fontSize: 19, marginTop: 10 }}>{drop.title}</h3>
              {drop.description && (
                <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4, lineHeight: 1.4 }}>
                  {drop.description.length > 80 ? drop.description.slice(0, 80) + '…' : drop.description}
                </p>
              )}
            </div>
          </Link>
        ))}

        {(!drops || drops.length === 0) && (
          <p style={{ color: 'var(--ink-soft)' }}>Nenhum drop publicado ainda.</p>
        )}
      </div>
    </div>
  )
}
