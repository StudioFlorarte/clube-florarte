import { createClient } from '@/lib/supabase/server'
import CommentSection from './comment-section'

export default async function DropPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: drop } = await supabase.from('drops').select('*').eq('id', params.id).single()

  if (!drop) {
    return <p>Esse drop não foi encontrado.</p>
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <p style={{ fontSize: 12, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {drop.category}
      </p>
      <h1 style={{ fontSize: 32, marginTop: 4 }}>{drop.title}</h1>
      {drop.description && (
        <p style={{ color: 'var(--ink-soft)', marginTop: 12, lineHeight: 1.6 }}>{drop.description}</p>
      )}

      <a href={drop.canva_url} target="_blank" rel="noreferrer" className="btn-primary" style={{ display: 'inline-block', marginTop: 24, textDecoration: 'none' }}>
        Abrir no Canva
      </a>

      <div style={{ marginTop: 48 }}>
        <h2 style={{ fontSize: 22, marginBottom: 16 }}>Comentários</h2>
        <CommentSection dropId={drop.id} />
      </div>
    </div>
  )
}
