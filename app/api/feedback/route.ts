import { NextRequest, NextResponse } from 'next/server'
import { trustedAppOrigin } from '@/lib/app-origin'
import nodemailer from 'nodemailer'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
export const runtime='nodejs'
export async function POST(request:NextRequest){
 if(!trustedAppOrigin(request.headers.get('origin'),request.url))return NextResponse.json({error:'error'},{status:403})
 const client=createClient();const {data:{user}}=await client.auth.getUser()
 if(!user)return NextResponse.json({error:'error'},{status:401})
 const {data:access,error:accessError}=await client.rpc('has_club_access');if(accessError||!access)return NextResponse.json({error:'error'},{status:403})
 if(!process.env.SMTP_USER||!process.env.SMTP_PASSWORD||!process.env.SUPABASE_SERVICE_ROLE_KEY)return NextResponse.json({error:'feedbackUnavailable'},{status:503})
 let body;try{body=await request.json()}catch{return NextResponse.json({error:'invalidFields'},{status:400})}
 const {message,rating,id}=body
 if(typeof message!=='string'||!message.trim()||message.length>5000||!Number.isInteger(rating)||rating<0||rating>5||typeof id!=='string'||!/^[a-f0-9-]{36}$/.test(id))return NextResponse.json({error:'invalidFields'},{status:400})
 const admin=createAdminClient()
 const {data:existing,error:lookupError}=await admin.from('feedback').select('author_id,email_sent_at').eq('id',id).maybeSingle()
 if(lookupError)return NextResponse.json({error:'error'},{status:500})
 if(existing&&existing.author_id!==user.id)return NextResponse.json({error:'error'},{status:403})
 if(existing?.email_sent_at)return NextResponse.json({ok:true})
 if(!existing){const {count,error}=await admin.from('feedback').select('id',{count:'exact',head:true}).eq('author_id',user.id).gte('created_at',new Date(Date.now()-60000).toISOString());if(error)return NextResponse.json({error:'error'},{status:500});if((count??0)>=3)return NextResponse.json({error:'error'},{status:429})
 const {error:saveError}=await admin.from('feedback').insert({id,author_id:user.id,message:message.trim(),rating:rating||null});if(saveError)return NextResponse.json({error:'error'},{status:500})}
 try{
 const transport=nodemailer.createTransport({host:process.env.SMTP_HOST||'smtp.hostinger.com',port:465,secure:true,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD},connectionTimeout:10000,socketTimeout:15000,disableFileAccess:true,disableUrlAccess:true})
 await transport.sendMail({from:process.env.SMTP_USER,to:'hello@studioflorarte.com',replyTo:user.email,subject:'Novo feedback — Clube Florarte',text:`Membro: ${user.email}\nNota: ${rating||'—'}/5\n\n${message.trim()}`,messageId:`<feedback-${id}@studioflorarte.com>`})
 const {error}=await admin.from('feedback').update({email_sent_at:new Date().toISOString()}).eq('id',id);if(error)throw error
 return NextResponse.json({ok:true})
 }catch{return NextResponse.json({error:'feedbackUnavailable'},{status:502})}
}
