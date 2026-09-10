import {getLocale} from '@/lib/locale-server'
import {validLocale} from '@/lib/i18n'
import ResetForm from './reset-form'
export const metadata={robots:{index:false,follow:false},referrer:'strict-origin' as const}
export default function ResetPasswordPage({searchParams}:{searchParams:{lang?:string;error?:string}}){return <ResetForm locale={searchParams.lang?validLocale(searchParams.lang):getLocale()} invalid={searchParams.error==='invalid'}/>}

