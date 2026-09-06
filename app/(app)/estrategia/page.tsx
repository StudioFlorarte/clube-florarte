import { getLocale, getT } from '@/lib/locale-server'
import styles from './strategy.module.css'

const notionTemplateUrl = 'https://jungle-client-286.notion.site/Clube-Florarte-Seu-espa-o-de-estrat-gia-3d34b5b025dd81c8a379fed5f93253be'

const englishNotionTemplateUrl = 'https://jungle-client-286.notion.site/Florarte-Club-Your-Content-Strategy-Workspace-English-3d34b5b025dd81baa494c54c8e28ab60'

const internationalCopy = {
  "en": {
    "intro": "Your space to turn your brand brief into content with direction.",
    "label": "YOUR NOTION STUDIO",
    "title": "Plan, adapt and create at your own pace.",
    "description": "Keep your brief, copy and calendar in a workspace of your own. Use the audience you defined and adapt each piece of content to your brand.",
    "includesLabel": "What you will find inside",
    "stats": [
      [
        "13 guides",
        "for different niches"
      ],
      [
        "52 content briefs",
        "across 26 weeks"
      ],
      [
        "18 prompts",
        "including other niches"
      ]
    ],
    "open": "Open my Notion workspace",
    "newTab": "opens in a new tab",
    "note": "The Notion workspace is in English. You need a Notion account. Open the template and click Duplicate to create your own copy.",
    "stepsTitle": "Start with your own copy",
    "steps": [
      [
        "Open the template and sign in to Notion.",
        "Click Duplicate at the top of the page and choose your workspace."
      ],
      [
        "Complete your brief.",
        "Define your audience, offer and voice. If your niche is not in the library, use prompt P09."
      ],
      [
        "Personalise and track.",
        "Adapt the briefs and use the planning, calendar, production, review and results views."
      ]
    ],
    "independent": "Your edits stay in your copy and do not change the Florarte template. Future template updates are not automatically applied to your copy."
  },
  "fr": {
    "intro": "Votre espace pour transformer le brief de votre marque en contenus avec une direction claire.",
    "label": "VOTRE ATELIER NOTION",
    "title": "Planifiez, adaptez et créez à votre rythme.",
    "description": "Réunissez votre brief, vos textes et votre calendrier dans votre propre espace. Appuyez-vous sur le public que vous avez défini et adaptez chaque contenu à votre marque.",
    "includesLabel": "Ce que vous trouverez dans cet espace",
    "stats": [
      [
        "13 guides",
        "pour différents secteurs"
      ],
      [
        "52 fiches de contenu",
        "sur 26 semaines"
      ],
      [
        "18 prompts",
        "y compris pour d’autres secteurs"
      ]
    ],
    "open": "Ouvrir mon espace Notion",
    "newTab": "s’ouvre dans un nouvel onglet",
    "note": "L’espace Notion est en anglais. Un compte Notion est nécessaire. Ouvrez le modèle et cliquez sur Dupliquer pour créer votre copie.",
    "stepsTitle": "Commencez par votre propre copie",
    "steps": [
      [
        "Ouvrez le modèle et connectez-vous à Notion.",
        "Cliquez sur Dupliquer en haut de la page, puis choisissez votre espace de travail."
      ],
      [
        "Complétez votre brief.",
        "Définissez votre public, votre offre et votre ton. Si votre secteur ne figure pas dans la bibliothèque, utilisez le prompt P09."
      ],
      [
        "Personnalisez et suivez vos progrès.",
        "Adaptez les fiches et utilisez les vues de planification, calendrier, production, révision et résultats."
      ]
    ],
    "independent": "Vos modifications restent dans votre copie et ne changent pas le modèle Florarte. Les futures mises à jour du modèle ne sont pas appliquées automatiquement à votre copie."
  },
  "es": {
    "intro": "Tu espacio para convertir el briefing de tu marca en contenido con dirección.",
    "label": "TU TALLER EN NOTION",
    "title": "Planifica, adapta y crea a tu ritmo.",
    "description": "Reúne tu briefing, tus textos y tu calendario en un espacio propio. Usa el público que definiste y adapta cada contenido a la realidad de tu marca.",
    "includesLabel": "Qué encontrarás en este espacio",
    "stats": [
      [
        "13 guías",
        "para distintos nichos"
      ],
      [
        "52 propuestas de contenido",
        "para 26 semanas"
      ],
      [
        "18 prompts",
        "también para otros nichos"
      ]
    ],
    "open": "Abrir mi espacio en Notion",
    "newTab": "se abre en una pestaña nueva",
    "note": "El espacio de Notion está en inglés. Necesitas una cuenta de Notion. Abre la plantilla y haz clic en Duplicar para crear tu copia.",
    "stepsTitle": "Empieza con tu propia copia",
    "steps": [
      [
        "Abre la plantilla e inicia sesión en Notion.",
        "Haz clic en Duplicar en la parte superior de la página y elige tu espacio de trabajo."
      ],
      [
        "Completa tu briefing.",
        "Define tu público, tu oferta y tu voz. Si tu nicho aún no está en la biblioteca, usa el prompt P09."
      ],
      [
        "Personaliza y haz seguimiento.",
        "Adapta las propuestas y usa las vistas de planificación, calendario, producción, revisión y resultados."
      ]
    ],
    "independent": "Tus cambios se guardan en tu copia y no modifican la plantilla Florarte. Las futuras actualizaciones de la plantilla no se aplican automáticamente a tu copia."
  }
} as const

export default function EstrategiaPage() {
  const t = getT()
  const locale = getLocale()
  if (locale !== 'pt') {
    const copy = internationalCopy[locale]
    return (
      <div className={styles.page} lang={locale}>
        <header className={styles.header}>
          <h1>{t('strategyTitle')}</h1>
          <p>{copy.intro}</p>
        </header>
        <section className={styles.template} aria-labelledby="notion-title">
          <span className={styles.label}>{copy.label}</span>
          <h2 id="notion-title">{copy.title}</h2>
          <p>{copy.description}</p>
          <ul className={styles.includes} aria-label={copy.includesLabel}>
            {copy.stats.map(([count, detail]) => (
              <li key={count}><strong>{count}</strong><span>{detail}</span></li>
            ))}
          </ul>
          <a className={styles.open} href={englishNotionTemplateUrl} target="_blank" rel="noopener noreferrer" aria-describedby="notion-language">
            {copy.open} <span aria-hidden="true">↗</span>
            <span className={styles.srOnly}> ({copy.newTab})</span>
          </a>
          <p id="notion-language" className={styles.note}>{copy.note}</p>
        </section>
        <section className={styles.instructions} aria-labelledby="copy-title">
          <h2 id="copy-title">{copy.stepsTitle}</h2>
          <ol>
            {copy.steps.map(([title, detail]) => (
              <li key={title}><strong>{title}</strong> {detail}</li>
            ))}
          </ol>
          <p>{copy.independent}</p>
        </section>
      </div>
    )
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
