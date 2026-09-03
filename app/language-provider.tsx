'use client'
import { createContext, useContext } from 'react'
import { useRouter } from 'next/navigation'
import { Locale, Key, translate, locales, languageNames } from '@/lib/i18n'
const Context = createContext<Locale>('pt')
export function LanguageProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) { return <Context.Provider value={locale}>{children}</Context.Provider> }
export function useLanguage() { const locale = useContext(Context); return { locale, t: (key: Key) => translate(locale, key) } }
export function LanguageSelect() {
  const { locale } = useLanguage(); const router = useRouter()
  return <label className="language-select"><span aria-hidden>◎</span><select aria-label="Language / Idioma / Langue" value={locale} onChange={e => { document.cookie = `locale=${e.target.value};path=/;max-age=31536000;SameSite=Lax`; router.refresh() }}>{locales.map(l => <option value={l} key={l}>{languageNames[l]}</option>)}</select></label>
}
