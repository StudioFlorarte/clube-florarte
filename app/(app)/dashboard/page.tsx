import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/locale-server'
import { communityText } from '@/lib/community'
import FeedComposer from './feed-composer'
import FeedCard from './feed-card'
export default async function DashboardPage({searchParams}:{searchParams:{page?:string}}){
 const client=createClient(),locale=getLocale(),t=(k:Parameters<typeof communityText>[1])=>communityText(locale,k)
 const {data:{user}}=await client.auth.getUser();if(!user)return null
 const {data:profile}=await client.from('profiles').select('is_admin').eq('id',user.id).single()
 const page=Math.min(10000,Math.max(1,Number.parseInt(searchParams.page||'1')||1))
 const {data:posts,error,count}=await client.from('feed_posts').select('*,feed_likes(count),feed_comments(count)',{count:'exact'}).eq('locale',locale).eq('published',true).order('created_at',{ascending:false}).order('id',{ascending:false}).range((page-1)*10,page*10-1)
 const {data:likes}=posts?.length?await client.from('feed_likes').select('post_id').eq('user_id',user.id).in('post_id',posts.map(p=>p.id)):{data:[]}
 return <div className="club-feed"><section className="feed-hero"><p className="script">Clube Florarte</p><h1>{t('updates')}</h1><p>{t('feedHelp')}</p><img src="/brand/lirio.png" alt=""/></section>{profile?.is_admin&&<FeedComposer/>}{error?<p role="alert">{t('error')}</p>:!posts?.length?<div className="card feed-empty">✿<p>{t('empty')}</p></div>:posts.map(post=><FeedCard key={post.id} post={post} userId={user.id} isAdmin={!!profile?.is_admin} initialLiked={!!likes?.some(l=>l.post_id===post.id)}/>)}<nav className="feed-pagination" aria-label={t('feed')}>{page>1&&<Link className="btn-secondary" href={`/dashboard?page=${page-1}`}>← {t('previous')}</Link>}{(count||0)>page*10&&<Link className="btn-secondary" href={`/dashboard?page=${page+1}`}>{t('next')} →</Link>}</nav></div>
}
