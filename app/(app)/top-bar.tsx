'use client'
import { LanguageSelect } from '@/app/language-provider'
export default function TopBar({ name }: { name: string }) { return <header className="top-bar"><span>{name}</span><LanguageSelect /></header> }
