const packs = [
  { name: 'Ícones Marca & Negócio', count: '24 ícones', format: 'PNG transparente' },
  { name: 'Ícones Floral & Delicado', count: '18 ícones', format: 'PNG transparente' },
  { name: 'Ícones Conteúdo & Social', count: '20 ícones', format: 'PNG transparente' },
]

export default function IconsPage() {
  return (
    <div>
      <p style={{ fontFamily: 'var(--font-script)', fontSize: 24, color: 'var(--pink)', margin: 0 }}>biblioteca de</p>
      <h1 style={{ fontSize: 32, marginTop: 2 }}>Ícones</h1>
      <p style={{ color: 'var(--ink-soft)', marginTop: 8, maxWidth: 560 }}>
        Baixe os pacotes prontos em PNG, ou acesse a pasta com todos os ícones editáveis direto no Canva.
      </p>

      <a
        href="https://canva.com/SEU-LINK-DA-PASTA-DE-ICONES"
        target="_blank"
        rel="noreferrer"
        className="btn-primary"
        style={{ display: 'inline-block', marginTop: 20, textDecoration: 'none' }}
      >
        Abrir biblioteca completa no Canva
      </a>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, marginTop: 32 }}>
        {packs.map((pack) => (
          <div key={pack.name} className="card" style={{ padding: '22px 22px' }}>
            <div
              style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'linear-gradient(135deg, var(--yellow), var(--coral))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, marginBottom: 14,
              }}
            >
              ✦
            </div>
            <h3 style={{ fontSize: 17 }}>{pack.name}</h3>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 4 }}>
              {pack.count} · {pack.format}
            </p>
            <button className="btn-secondary" style={{ marginTop: 16, fontSize: 13, padding: '8px 18px' }}>
              Baixar pacote
            </button>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 24 }}>
        (Os links de download de cada pacote ficam prontos pra você conectar assim que subir os arquivos —
        me chame quando tiver os PNGs prontos que eu configuro o botão de baixar.)
      </p>
    </div>
  )
}
