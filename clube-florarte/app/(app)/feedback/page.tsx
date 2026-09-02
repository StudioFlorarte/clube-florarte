'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function FeedbackPage() {
  const supabase = createClient()
  const [message, setMessage] = useState('')
  const [rating, setRating] = useState(0)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !message.trim()) return
    await supabase.from('feedback').insert({ author_id: user.id, message, rating: rating || null })
    setMessage('')
    setRating(0)
    setSent(true)
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <p style={{ fontFamily: 'var(--font-script)', fontSize: 24, color: 'var(--pink)', margin: 0 }}>sua voz importa</p>
      <h1 style={{ fontSize: 32, marginTop: 2 }}>Feedback</h1>
      <p style={{ color: 'var(--ink-soft)', marginTop: 8 }}>
        Conte o que está funcionando, o que faltou e o que você quer ver nos próximos drops.
      </p>

      <form onSubmit={handleSubmit} className="card" style={{ padding: 28, marginTop: 24 }}>
        <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Como está sua experiência?</p>
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 26,
                cursor: 'pointer',
                color: n <= rating ? 'var(--yellow)' : '#EEDFC9',
              }}
            >
              ★
            </button>
          ))}
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Escreva aqui..."
          style={{ width: '100%', padding: 12, borderRadius: 12, border: '1.5px solid #EEDFC9', fontFamily: 'inherit' }}
        />
        <button type="submit" className="btn-primary" style={{ marginTop: 16 }}>
          Enviar feedback
        </button>
        {sent && <p style={{ color: 'var(--wine)', marginTop: 12 }}>Obrigada! Recebemos seu feedback 💌</p>}
      </form>
    </div>
  )
}
