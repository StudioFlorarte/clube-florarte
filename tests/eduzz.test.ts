import assert from 'node:assert/strict'
import { test } from 'node:test'
import { createHmac } from 'node:crypto'
import { annualEnd, parseInvoice, validSignature } from '../lib/eduzz'
test('validates the exact raw request and rejects forged signatures',()=>{const raw='{"event":"paid"}';const secret='test-secret';const signature=createHmac('sha256',secret).update(raw).digest('hex');assert.equal(validSignature(raw,signature,secret),true);assert.equal(validSignature(raw+' ',signature,secret),false);assert.equal(validSignature(raw,'invalid',secret),false);assert.equal(validSignature(raw,null,secret),false)})
test('annual access uses a calendar year, including leap years',()=>{assert.equal(annualEnd('2026-09-02T15:00:00Z'),'2027-09-02T15:00:00.000Z');assert.equal(annualEnd('2024-02-29T15:00:00Z'),'2025-02-28T15:00:00.000Z')})
const invoice={id:'event-1',event:'myeduzz.invoice_paid',data:{id:'invoice-1',status:'paid',paidAt:'2026-09-02T15:00:00Z',buyer:{email:'Buyer@Example.com',name:'Buyer'},items:[{productId:'3095513'}]}}
test('accepts both annual products and normalizes the recipient',()=>{assert.equal(parseInvoice(invoice)?.email,'buyer@example.com');assert.equal(parseInvoice({...invoice,data:{...invoice.data,items:[{productId:'3098697'}]}})?.product,'3098697')})

test('selects the invitation language from the purchased product, not buyer data',()=>{
 assert.equal(parseInvoice({...invoice,data:{...invoice.data,buyer:{...invoice.data.buyer,locale:'en'}}})?.locale,'pt')
 assert.equal(parseInvoice({...invoice,data:{...invoice.data,items:[{productId:3098697}],buyer:{...invoice.data.buyer,locale:'pt'}}})?.locale,'en')
})
test('unrelated products and events cannot grant access',()=>{assert.equal(parseInvoice({...invoice,event:'myeduzz.invoice_opened'}),null);assert.equal(parseInvoice({...invoice,data:{...invoice.data,items:[{productId:'other'}]}}),null);assert.throws(()=>parseInvoice({...invoice,data:{...invoice.data,status:'open'}}))})
test('uses the student recipient for gifted purchases and rejects ambiguous installment coverage',()=>{assert.equal(parseInvoice({...invoice,data:{...invoice.data,student:{email:'student@example.com'}}})?.email,'student@example.com');assert.throws(()=>parseInvoice({...invoice,data:{...invoice.data,contract:{isUnlimitedInstallments:true}}}));assert.throws(()=>parseInvoice({...invoice,data:{...invoice.data,bankSlipInstallment:{totalInstallments:12}}}))})
test('refunds and chargebacks map to the same invoice without creating a new annual period',()=>{for(const event of ['myeduzz.invoice_refunded','myeduzz.invoice_chargeback']){const parsed=parseInvoice({...invoice,event});assert.equal(parsed?.invoice,'invoice-1');assert.equal(parsed?.end,'2027-09-02T15:00:00.000Z')}})
