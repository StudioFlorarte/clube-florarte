import assert from 'node:assert/strict'
import { test } from 'node:test'
import { deliverInvitation, invitationFields, invitationTags } from '../lib/activecampaign'

test('both languages update the correct link before adding the delivery tag', async()=>{
 process.env.ACTIVECAMPAIGN_API_URL='https://studioflorarte95275.api-us1.com'
 process.env.ACTIVECAMPAIGN_API_KEY='test-only'
 for(const locale of ['pt','en'] as const){
  const calls:{url:string;body:any}[]=[]
  const send:typeof fetch=async(url,options)=>{
   const path=String(url);const body=options?.body?JSON.parse(String(options.body)):null;calls.push({url:path,body})
   let data:any={}
   if(path.includes('/fields?'))data={fields:[{id:'10',perstag:invitationFields[locale]}]}
   else if(path.includes('/tags?'))data={tags:[{id:'20',tag:invitationTags[locale]}]}
   else if(path.endsWith('/contact/sync'))data={contact:{id:'30'}}
   else if(path.includes('/contactLists'))data={contactLists:[{status:'1'}]}
   else if(path.includes('/contacts/30/contactTags'))data={contactTags:[]}
   else data={contactTag:{id:'40'}}
   return new Response(JSON.stringify(data),{status:200})
  }
  await deliverInvitation({email:'member@example.invalid',name:'Member Name',locale,url:'https://example.invalid/activate?token_hash=test'},send)
  const sync=calls.findIndex(c=>c.url.endsWith('/contact/sync'))
  const tag=calls.findIndex(c=>c.url.endsWith('/contactTags'))
  assert.ok(tag>sync)
  assert.equal(calls[sync].body.contact.fieldValues[0].value,'https://example.invalid/activate?token_hash=test')
  assert.deepEqual(calls[tag].body,{contactTag:{contact:'30',tag:'20'}})
 }
})

test('a retry with an existing delivery tag does not enqueue another email',async()=>{
 let tagged=false
 const send:typeof fetch=async(url,options)=>{
  const path=String(url)
  if(path.endsWith('/contactTags')&&options?.method==='POST')tagged=true
  const data=path.includes('/fields?')?{fields:[{id:'10',perstag:'FLORARTEACCESSURL'}]}:path.includes('/tags?')?{tags:[{id:'20',tag:'florarte-acesso-pronto-pt'}]}:path.endsWith('/contact/sync')?{contact:{id:'30'}}:path.includes('/contactLists')?{contactLists:[{status:'1'}]}:{contactTags:[{tag:'20'}]}
  return new Response(JSON.stringify(data))
 }
 await deliverInvitation({email:'member@example.invalid',name:'Member',locale:'pt',url:'https://example.invalid/activate'},send)
 assert.equal(tagged,false)
})

test('unsubscribed contacts are not enrolled or tagged for delivery',async()=>{
 let tagged=false
 const send:typeof fetch=async(url,options)=>{
  const path=String(url)
  if(path.endsWith('/contactTags')&&options?.method==='POST')tagged=true
  const data=path.includes('/fields?')?{fields:[{id:'10',perstag:'FLORARTEACCESSURL'}]}:path.includes('/tags?')?{tags:[{id:'20',tag:'florarte-acesso-pronto-pt'}]}:path.endsWith('/contact/sync')?{contact:{id:'30'}}:{contactLists:[{status:'2'}]}
  return new Response(JSON.stringify(data))
 }
 await assert.rejects(deliverInvitation({email:'member@example.invalid',name:'Member',locale:'pt',url:'https://example.invalid/activate'},send),{message:'activecampaign_contact_not_subscribed'})
 assert.equal(tagged,false)
})

test('provider failures stop before the automation trigger and do not expose credentials',async()=>{
 const send:typeof fetch=async()=>new Response('secret-link-and-email',{status:503})
 await assert.rejects(deliverInvitation({email:'member@example.invalid',name:'Member',locale:'pt',url:'https://example.invalid/activate'},send),{message:'activecampaign_request_failed_503'})
 process.env.ACTIVECAMPAIGN_API_URL='https://unexpected.example.invalid'
 await assert.rejects(deliverInvitation({email:'member@example.invalid',name:'Member',locale:'pt',url:'https://example.invalid'},send),{message:'activecampaign_not_configured'})
})
