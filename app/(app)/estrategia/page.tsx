export default function EstrategiaPage() {
  return (
    <div>
      <h1 style={{ fontSize: 32 }}>Estratégia de conteúdo</h1>
      <p style={{ color: 'var(--ink-soft)', marginTop: 8, maxWidth: 560 }}>
        Aqui vai entrar o board do Notion com o planejamento de conteúdo. Troque o link abaixo pelo
        link público do seu Notion (compartilhar → publicar na web) quando estiver pronto.
      </p>
      <div className="card" style={{ marginTop: 24, height: 500, overflow: 'hidden' }}>
        <iframe
          src="https://www.notion.so/SEU-LINK-PUBLICO-AQUI"
          style={{ width: '100%', height: '100%', border: 'none' }}
        />
      </div>
    </div>
  )
}
