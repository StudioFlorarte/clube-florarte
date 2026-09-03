import { cookies } from 'next/headers'
import { validLocale, translate, Key } from './i18n'
export function getLocale() { return validLocale(cookies().get('locale')?.value) }
export function getT() { const locale = getLocale(); return (key: Key) => translate(locale, key) }
