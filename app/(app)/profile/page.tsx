import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from './profile-form'
export default async function ProfilePage() {
  const client = createClient(); const { data: { user } } = await client.auth.getUser()
  if (!user) redirect('/login')
  const [{ data: profile }, { data: details }, { data: subscription }] = await Promise.all([
    client.from('profiles').select('display_name, avatar_url, is_admin').eq('id', user.id).single(),
    client.from('account_details').select('phone, instagram').eq('id', user.id).maybeSingle(),
    client.from('subscriptions').select('status, current_period_end').eq('user_id', user.id).in('status',['active','cancelled']).gt('current_period_end',new Date().toISOString()).order('current_period_end', { ascending: false }).limit(1).maybeSingle(),
  ])
  return <ProfileForm email={user.email ?? ''} userId={user.id} profile={profile} details={details} subscription={subscription} />
}
