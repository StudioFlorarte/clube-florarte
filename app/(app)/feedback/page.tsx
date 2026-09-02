'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function FeedbackPage() {
  const supabase = createClient()
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !message.trim()) return
    await supabase.from('feedback').insert({ author_id: user.id, message })
    setMessage('')
    setSent(true)
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <h1 style={{ fontSize: 32 }}>Feedback</h1>
      <p style={{ color: 'var(--ink-soft)', marginTop: 8 }}>
        Sugestões, elogios ou algo que sentiu falta no Clube? Conta pra gente.
      </p>

      <form onSubmit={handleSubmit} className="card" style={{ padding: 24, marginTop: 24 }}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Escreva aqui..."
          style={{ width: '100%', padding: 12, borderRadius: 10, border: '1.5px solid #EEDFC9', fontFamily: 'inherit' }}
        />
        <button type="submit" className="btn-primary" style={{ marginTop: 16 }}>
          Enviar feedback
        </button>
        {sent && <p style={{ color: 'var(--wine)', marginTop: 12 }}>Obrigada! Recebemos seu feedback 💌</p>}
      </form>
    </div>
  )
}
