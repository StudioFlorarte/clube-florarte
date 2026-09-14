import {createClient} from '@/lib/supabase/server';
import LandingVisitsPanel from './landing-visits-panel';
export default async function LandingVisits(){const client=createClient();const {data:{user}}=await client.auth.getUser();if(!user)return null;const {data:profile}=await client.from('profiles').select('is_admin').eq('id',user.id).single();return profile?.is_admin?<LandingVisitsPanel/>:null;}

