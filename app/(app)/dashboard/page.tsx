import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: drops } = await supabase
    .from('drops')
    .select('id, title, cover_url, category, created_at')
    .order('created_at', { ascending: false })

  const isNew = (createdAt: string) => {
    const days = (Date.now() - new Date(createdAt).getTime()) / 86400000
    return days <= 30
  }

  return (
    <div>
      <h1 style={{ fontSize: 34 }}>Seus drops</h1>
      <p style={{ color: 'var(--ink-soft)', marginTop: 8, maxWidth: 560 }}>
        Escolha uma coleção para acessar os templates no Canva. Toda entrega nova aparece marcada como
        <strong> Novo</strong> por 30 dias.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: 24,
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
                height: 150,
                background: drop.cover_url
                  ? `url(${drop.cover_url}) center/cover`
                  : 'linear-gradient(135deg, var(--yellow), var(--coral))',
                position: 'relative',
              }}
            >
              {isNew(drop.created_at) && (
                <span
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    background: 'var(--pink)',
                    color: 'white',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: 999,
                  }}
                >
                  Novo
                </span>
              )}
            </div>
            <div style={{ padding: '16px 18px' }}>
              <p style={{ fontSize: 12, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {drop.category}
              </p>
              <h3 style={{ fontSize: 19, marginTop: 4 }}>{drop.title}</h3>
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
