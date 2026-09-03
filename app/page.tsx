import Link from 'next/link'

const features = [
  { title: 'Drops mensais', desc: 'Coleções novas de templates todo mês, sempre com um tema e uma vibe.' },
  { title: 'Biblioteca de ícones', desc: 'Elementos prontos para dar personalidade ao seu feed.' },
  { title: 'Paletas & fontes', desc: 'Combinações testadas para você nunca mais travar na escolha.' },
  { title: 'Estratégia de conteúdo', desc: 'Um Notion guiado para planejar o que publicar.' },
]

export default function LandingPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '80px 24px',
      }}
    >
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--wine)', letterSpacing: 0.5 }}>
        studio <span style={{ fontFamily: 'var(--font-script)', fontSize: 32 }}>FlorArte</span>
      </p>

      <p style={{ fontFamily: 'var(--font-script)', fontSize: 32, color: 'var(--pink)', marginTop: 32 }}>
        bem-vinda ao
      </p>
      <h1 style={{ fontSize: 52, maxWidth: 700 }}>Clube Florarte</h1>
      <p style={{ color: 'var(--ink-soft)', maxWidth: 520, marginTop: 16, fontSize: 17, lineHeight: 1.6 }}>
        Um clube de templates de Canva para empreendedoras, criadoras e social medias que querem um
        visual bonito, alegre e com elegância de estúdio.
      </p>

      <div style={{ display: 'flex', gap: 14, marginTop: 32 }}>
        <Link href="/login" className="btn-primary" style={{ textDecoration: 'none' }}>
          Entrar no clube
        </Link>
        <a
          href="https://wa.me/5541933004004?text=Oi!%20Quero%20fazer%20parte%20do%20Clube%20Florarte"
          target="_blank"
          rel="noreferrer"
          className="btn-secondary"
          style={{ textDecoration: 'none' }}
        >
          Quero fazer parte
        </a>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20,
          marginTop: 56,
          maxWidth: 960,
          width: '100%',
        }}
      >
        {features.map((f) => (
          <div key={f.title} className="card" style={{ padding: '24px 22px', textAlign: 'left' }}>
            <h3 style={{ fontSize: 18, marginBottom: 8 }}>{f.title}</h3>
            <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.5 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
