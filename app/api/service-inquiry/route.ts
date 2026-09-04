import {NextRequest,NextResponse} from 'next/server'
import nodemailer from 'nodemailer'
import {trustedAppOrigin} from '@/lib/app-origin'
import {createClient} from '@/lib/supabase/server'
export const runtime='nodejs'
const allowedPlans=new Set(['Essência','Florescer','Raízes','Essence','Bloom','Roots','Floraison','Racines','Esencia','Florecer','Raíces'])
export async function POST(request:NextRequest){
 if(!trustedAppOrigin(request.headers.get('origin'),request.url))return NextResponse.json({error:'error'},{status:403})
 const client=createClient();const {data:{user}}=await client.auth.getUser();if(!user?.email)return NextResponse.json({error:'error'},{status:401})
 const {data:access,error:accessError}=await client.rpc('has_club_access');if(accessError||!access)return NextResponse.json({error:'error'},{status:403})
 if(!process.env.SMTP_USER||!process.env.SMTP_PASSWORD)return NextResponse.json({error:'unavailable'},{status:503})
 let payload;try{payload=await request.json()}catch{return NextResponse.json({error:'invalid'},{status:400})}
 const {plan,message,locale}=payload
 if(typeof plan!=='string'||!allowedPlans.has(plan)||typeof message!=='string'||message.trim().length<10||message.length>3000||!['pt','en','fr','es'].includes(locale))return NextResponse.json({error:'invalid'},{status:400})
 try{const transport=nodemailer.createTransport({host:process.env.SMTP_HOST||'smtp.hostinger.com',port:465,secure:true,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD},connectionTimeout:10000,socketTimeout:15000,disableFileAccess:true,disableUrlAccess:true});await transport.sendMail({from:process.env.SMTP_USER,to:'hello@studioflorarte.com',replyTo:user.email,subject:`Interesse no serviço ${plan} — Florarte`,text:`De: ${user.email}\nPlano: ${plan}\nIdioma: ${locale}\n\n${message.trim()}`});return NextResponse.json({ok:true})}catch{return NextResponse.json({error:'unavailable'},{status:502})}
}
