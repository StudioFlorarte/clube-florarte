'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewDropForm() {
  const supabase = createClient()
  const router = useRouter()
  const [form, setForm] = useState({ title: '', category: '', canva_url: '', cover_url: '', description: '' })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('drops').insert(form)
    setSaving(false)
    setForm({ title: '', category: '', canva_url: '', cover_url: '', description: '' })
    router.refresh()
  }

  const field = (key: keyof typeof form, label: string, placeholder: string) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{label}</label>
      <input
        required={key !== 'description' && key !== 'cover_url'}
        value={form[key]}
        placeholder={placeholder}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #EEDFC9' }}
      />
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: 24, maxWidth: 480 }}>
      {field('title', 'Nome do drop', 'Drop Rose')}
      {field('category', 'Categoria', 'Feed · Stories · Reels')}
      {field('canva_url', 'Link do Canva', 'https://canva.com/...')}
      {field('cover_url', 'Imagem de capa (URL, opcional)', 'https://...')}
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Descrição (opcional)</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #EEDFC9', fontFamily: 'inherit' }}
        />
      </div>
      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Publicando...' : 'Publicar drop'}
      </button>
    </form>
  )
}
