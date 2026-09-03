'use client'
import { useLanguage } from './language-provider'
export default function BrandLogo({className}:{className?:string}){const {locale}=useLanguage();const portuguese=locale==='pt';return <img className={className} src={portuguese?'/brand/clube-florarte-pt.png':'/brand/florarte-club-intl.png'} alt={portuguese?'Clube Florarte':'Florarte Club'}/>}
