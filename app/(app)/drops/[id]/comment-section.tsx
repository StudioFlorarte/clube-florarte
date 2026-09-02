'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Comment = {
  id: string
  body: string
  created_at: string
  author_name: string | null
}

export default function CommentSection({ dropId }: { dropId: string }) {
  const supabase = createClient()
  const [comments, setComments] = useState<Comment[]>([])
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadComments() {
    const { data } = await supabase
      .from('comments')
      .select('id, body, created_at, profiles(display_name)')
      .eq('drop_id', dropId)
      .order('created_at', { ascending: false })

    setComments(
      (data ?? []).map((c: any) => ({
        id: c.id,
        body: c.body,
        created_at: c.created_at,
        author_name: c.profiles?.display_name ?? 'Membro',
      }))
    )
  }

  useEffect(() => {
    loadComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!body.trim()) return
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('comments').insert({ drop_id: dropId, author_id: user.id, body })
      setBody('')
      await loadComments()
    }
    setLoading(false)
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Deixe seu feedback sobre esse drop..."
          style={{
            flex: 1,
            padding: '12px 14px',
            borderRadius: 12,
            border: '1.5px solid #EEDFC9',
            fontSize: 14,
          }}
        />
        <button type="submit" disabled={loading} className="btn-secondary">
          Enviar
        </button>
      </form>

      {comments.map((c) => (
        <div key={c.id} style={{ padding: '12px 0', borderBottom: '1px solid #F1E4CC' }}>
          <p style={{ fontWeight: 600, fontSize: 14 }}>{c.author_name}</p>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>{c.body}</p>
        </div>
      ))}

      {comments.length === 0 && <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>Seja a primeira a comentar.</p>}
    </div>
  )
}
