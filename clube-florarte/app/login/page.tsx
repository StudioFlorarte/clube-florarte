'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('E-mail ou senha incorretos. Tente novamente.')
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at 20% 20%, rgba(255,213,91,0.35), transparent 45%), radial-gradient(circle at 80% 80%, rgba(255,114,114,0.3), transparent 45%), var(--bg)',
        padding: 24,
      }}
    >
      <form
        onSubmit={handleLogin}
        className="card"
        style={{ width: '100%', maxWidth: 400, padding: '40px 32px' }}
      >
        <p style={{ fontFamily: 'var(--font-script)', fontSize: 32, color: 'var(--pink)', margin: 0 }}>
          Bem-vinda ao
        </p>
        <h1 style={{ fontSize: 32, marginBottom: 24 }}>Clube Florarte</h1>

        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
          E-mail
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <label style={{ display: 'block', fontSize: 14, fontWeight: 600, margin: '16px 0 6px' }}>
          Senha
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {error && (
          <p style={{ color: 'var(--wine)', fontSize: 14, marginTop: 12 }}>{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: 24 }}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <p style={{ fontSize: 13, color: 'var(--ink-soft)', textAlign: 'center', marginTop: 20 }}>
          Ainda não tem acesso?{' '}
          <a href="https://wa.me/SEUNUMEROAQUI" target="_blank" rel="noreferrer" style={{ color: 'var(--wine)', fontWeight: 600 }}>
            Fale com a gente
          </a>
        </p>
      </form>
    </main>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 12,
  border: '1.5px solid #EEDFC9',
  fontSize: 15,
  fontFamily: 'var(--font-body)',
}
