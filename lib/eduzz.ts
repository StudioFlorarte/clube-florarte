import { createHmac, timingSafeEqual } from 'node:crypto'
export const annualProducts = new Set(['3095513','3098697'])
export const productLocales: Record<string, 'pt' | 'en'> = { '3095513': 'pt', '3098697': 'en' }
export function validSignature(raw:string, signature:string|null, secret:string){
 if(!signature||!/^[a-f0-9]{64}$/i.test(signature))return false
 return timingSafeEqual(createHmac('sha256',secret).update(raw).digest(),Buffer.from(signature,'hex'))
}
export function annualEnd(paidAt:string){
 const date=new Date(paidAt);if(!Number.isFinite(date.getTime()))throw Error('Invalid payment date')
 const month=date.getUTCMonth();date.setUTCFullYear(date.getUTCFullYear()+1)
 if(date.getUTCMonth()!==month)date.setUTCDate(0)
 return date.toISOString()
}
export function parseInvoice(payload:any){
 if(!['myeduzz.invoice_paid','myeduzz.invoice_refunded','myeduzz.invoice_chargeback'].includes(payload?.event))return null
 const d=payload.data
 const item=Array.isArray(d?.items)?d.items.find((i:any)=>annualProducts.has(String(i.productId))):null
 if(!item)return null
 const email=(d.student?.email||d.buyer?.email)?.trim().toLowerCase()
 if(typeof payload.id!=='string'||!payload.id||!d.id||typeof email!=='string'||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!d.paidAt)throw Error('Invalid invoice')
 // PSL/bank-slip installment contracts need their paid coverage verified separately.
 if(d.contract?.isUnlimitedInstallments||d.bankSlipInstallment?.totalInstallments>1)throw Error('Installment coverage requires reconciliation')
 if(payload.event==='myeduzz.invoice_paid'&&d.status!=='paid')throw Error('Unpaid invoice')
 return {eventId:payload.id,event:payload.event,invoice:String(d.id),email,product:String(item.productId),locale:productLocales[String(item.productId)],contract:d.contract?.id?String(d.contract.id):null,paidAt:new Date(d.paidAt).toISOString(),end:annualEnd(d.paidAt),name:String(d.student?.name||d.buyer?.name||'Membro').slice(0,100)}
}
