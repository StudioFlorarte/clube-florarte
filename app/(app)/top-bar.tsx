 'use client'
import {LanguageSelect} from '@/app/language-provider'
import NotificationCenter from './notification-center'
export default function TopBar(){return <header className="top-bar"><NotificationCenter/><LanguageSelect/></header>}
