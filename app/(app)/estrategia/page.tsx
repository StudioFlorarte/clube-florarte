import { getLocale, getT } from '@/lib/locale-server'
import styles from './strategy.module.css'

const notionTemplateUrl = 'https://jungle-client-286.notion.site/Clube-Florarte-Seu-espa-o-de-estrat-gia-3d34b5b025dd81c8a379fed5f93253be'

export default function EstrategiaPage() {
  const t = getT()
  if (getLocale() !== 'pt') {
    return <div><h1>{t('strategyTitle')}</h1><p>{t('strategyHelp')}</p></div>
  }

  return (
    <div className={styles.page} lang="pt-BR">
      <header className={styles.header}>
        <h1>{t('strategyTitle')}</h1>
        <p>Seu espaço para transformar o briefing da sua marca em conteúdo com direção.</p>
      </header>

      <section className={styles.template} aria-labelledby="notion-title">
        <span className={styles.label}>SEU ATELIÊ NO NOTION</span>
        <h2 id="notion-title">Planeje, adapte e crie no seu ritmo.</h2>
        <p>Reúna seu briefing, suas copys e seu calendário em uma cópia só sua. Use o público que você definiu e adapte cada conteúdo à realidade da sua marca.</p>
        <ul className={styles.includes} aria-label="O que você encontra no espaço">
          <li><strong>13 guias</strong><span>de nichos para adaptar</span></li>
          <li><strong>52 pautas</strong><span>para 26 semanas</span></li>
          <li><strong>18 prompts</strong><span>inclusive para outros nichos</span></li>
        </ul>
        <a className={styles.open} href={notionTemplateUrl} target="_blank" rel="noopener noreferrer">
          Abrir meu espaço no Notion <span aria-hidden="true">↗</span>
          <span className={styles.srOnly}> (abre em uma nova aba)</span>
        </a>
        <p className={styles.note}>Você precisa de uma conta no Notion. Ao abrir o modelo, clique em Duplicar para criar sua cópia.</p>
      </section>

      <section className={styles.instructions} aria-labelledby="copy-title">
        <h2 id="copy-title">Comece pela sua cópia</h2>
        <ol>
          <li><strong>Abra o modelo e entre no Notion.</strong> Clique em Duplicar no topo da página e escolha seu espaço de trabalho.</li>
          <li><strong>Preencha seu briefing.</strong> Defina público, oferta e voz. Se seu nicho ainda não estiver na biblioteca, use o prompt P09.</li>
          <li><strong>Personalize e acompanhe.</strong> Adapte as pautas e use as vistas de planejamento, calendário, produção, revisão e resultados.</li>
        </ol>
        <p>Suas edições ficam na sua cópia e não alteram o modelo Florarte. Atualizações futuras do modelo não são aplicadas automaticamente à sua cópia.</p>
      </section>
    </div>
  )
}
