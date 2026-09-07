import {notFound} from 'next/navigation'
import Link from 'next/link'
import {createClient} from '@/lib/supabase/server'
import {getLocale} from '@/lib/locale-server'
import {communityText} from '@/lib/community'
import FeedCard from '../feed-card'
export default async function PostPage({params}:{params:{id:string}}){const c=createClient();const {data:{user}}=await c.auth.getUser();if(!user)return null;const {data:post}=await c.from('feed_posts').select('*,feed_likes(count),feed_comments(count)').eq('id',params.id).eq('published',true).maybeSingle();if(!post)notFound();const [{data:profile},{data:like}]=await Promise.all([c.from('profiles').select('is_admin').eq('id',user.id).single(),c.from('feed_likes').select('post_id').eq('post_id',post.id).eq('user_id',user.id).maybeSingle()]);return <div className="club-feed"><p><Link href="/dashboard">← {communityText(getLocale(),'feed')}</Link></p><FeedCard post={post} userId={user.id} isAdmin={!!profile?.is_admin} initialLiked={!!like}/></div>}
