import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SidebarNav from './sidebar-nav'
import TopBar from './top-bar'
export default async function AppLayout({ children }: { children: React.ReactNode }) {
 const client = createClient(); const { data: { user } } = await client.auth.getUser()
 if (!user) redirect('/login')
 const { data: profile } = await client.from('profiles').select('is_admin, display_name, avatar_url').eq('id', user.id).single()
 const name = profile?.display_name || user.email || ''
 return <div className="app-shell"><SidebarNav isAdmin={!!profile?.is_admin} name={name} email={user.email || ""} avatar={profile?.avatar_url} /><div className="app-body"><TopBar /><main className="page-content">{children}</main></div></div>
}
