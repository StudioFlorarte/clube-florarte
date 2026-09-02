'use client'

import { useState } from 'react'

const palettes = [
  { name: 'Florarte Original', colors: ['#B00E42', '#FF3965', '#FF7272', '#FFD55B', '#F0E1C2'] },
  { name: 'Pôr do sol', colors: ['#B00E42', '#FF7272', '#FF8A3D', '#FFC64B', '#FFE9C7'] },
  { name: 'Minimal Bege', colors: ['#3B2A22', '#8C6A55', '#C9A88A', '#E8CDB6', '#FBF5EE'] },
  { name: 'Doce Verão', colors: ['#FF3965', '#FF9BB0', '#FFD5DC', '#FFE9C7', '#FFFDFA'] },
]

const fontPairs = [
  { label: 'Assinatura do clube', main: 'Amoresa (script)', sub: '+ Work Sans', note: 'Use o script só em destaques curtos: nomes, chamadas e assinaturas.' },
  { label: 'Editorial elegante', main: 'Operetta / Playfair Display', sub: '+ Work Sans', note: 'Serifada nos títulos e sans no corpo — o combo mais versátil para carrosséis.' },
  { label: 'Direto ao ponto', main: 'Work Sans Bold', sub: '+ Work Sans Light', note: 'Para conteúdos didáticos, listas e posts com muita informação.' },
]

export default function PalettesPage() {
  const [copied, setCopied] = useState<string | null>(null)

  function copy(hex: string) {
    navigator.clipboard.writeText(hex)
    setCopied(hex)
    setTimeout(() => setCopied(null), 1200)
  }

  return (
    <div>
      <p style={{ fontFamily: 'var(--font-script)', fontSize: 24, color: 'var(--pink)', margin: 0 }}>paletas &</p>
      <h1 style={{ fontSize: 32, marginTop: 2 }}>Fontes</h1>
      <p style={{ color: 'var(--ink-soft)', marginTop: 8, maxWidth: 560 }}>
        Combinações prontas para aplicar direto nos templates. Clique em qualquer cor para copiar o código.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20, marginTop: 28 }}>
        {palettes.map((p) => (
          <div key={p.name} className="card" style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', height: 80 }}>
              {p.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => copy(c)}
                  style={{ flex: 1, background: c, border: 'none', cursor: 'pointer' }}
                  title={c}
                />
              ))}
            </div>
            <div style={{ padding: '14px 18px' }}>
              <h3 style={{ fontSize: 16 }}>{p.name}</h3>
              <p style={{ fontSize: 12, color: 'var(--ink-soft)', marginTop: 4 }}>
                {copied && p.colors.includes(copied) ? `Copiado: ${copied}` : p.colors.join(' · ')}
              </p>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 22, marginTop: 44, marginBottom: 16 }}>Combinações de fontes</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
        {fontPairs.map((f) => (
          <div key={f.label} className="card" style={{ padding: '20px 22px' }}>
            <p style={{ fontSize: 11, letterSpacing: 1, color: 'var(--ink-soft)' }}>{f.label.toUpperCase()}</p>
            <h3 style={{ fontSize: 20, marginTop: 6 }}>{f.main}</h3>
            <p style={{ fontSize: 13, color: 'var(--pink)', fontWeight: 600, marginTop: 2 }}>{f.sub}</p>
            <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginTop: 10, lineHeight: 1.5 }}>{f.note}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
