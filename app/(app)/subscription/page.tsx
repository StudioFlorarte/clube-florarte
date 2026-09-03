import Link from 'next/link'
import {getT} from '@/lib/locale-server'
export default function SubscriptionPage(){const t=getT();return <section className="narrow card form-card"><h1>{t('inactive')}</h1><p>{t('inactiveHelp')}</p><Link href="/profile" className="btn-secondary">{t('profile')}</Link><p><a href="mailto:hello@studioflorarte.com">{t('support')}</a></p></section>}
