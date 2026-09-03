type Locale = 'pt' | 'en'
export const invitationFields = { pt: 'FLORARTEACCESSURL', en: 'FLORARTEACCESSURLEN' } as const
export const invitationTags = { pt: 'florarte-acesso-pronto-pt', en: 'florarte-acesso-pronto-en' } as const

export function activeCampaignConfigured() {
  return process.env.ACTIVECAMPAIGN_API_URL === 'https://studioflorarte95275.api-us1.com' && !!process.env.ACTIVECAMPAIGN_API_KEY
}

export async function deliverInvitation(input: { email: string; name: string; locale: Locale; url: string }, send: typeof fetch = fetch) {
  if (!activeCampaignConfigured()) throw new Error('activecampaign_not_configured')
  const base = process.env.ACTIVECAMPAIGN_API_URL!
  const api = async (path: string, body?: unknown) => {
    const response = await send(`${base}/api/3/${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: { 'Api-Token': process.env.ACTIVECAMPAIGN_API_KEY!, 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(10000),
    })
    // Never include provider response bodies: they can contain personal access links.
    if (!response.ok) throw new Error(`activecampaign_request_failed_${response.status}`)
    return response.json()
  }
  const perstag = invitationFields[input.locale]
  const tagName = invitationTags[input.locale]
  const fields = await api(`fields?filters[perstag]=${encodeURIComponent(perstag)}`)
  const matchingFields = fields.fields?.filter((field: any) => field.perstag === perstag)
  const tags = await api(`tags?search=${encodeURIComponent(tagName)}&limit=100`)
  const matchingTags = tags.tags?.filter((tag: any) => tag.tag === tagName)
  if (matchingFields?.length !== 1 || matchingTags?.length !== 1) throw new Error('activecampaign_fields_or_tags_missing')
  const result = await api('contact/sync', { contact: {
    email: input.email,
    ...(input.name.trim() ? {firstName: input.name.trim().split(' ')[0]} : {}),
    fieldValues: [{ field: matchingFields[0].id, value: input.url }],
  } })
  const contact = String(result.contact?.id || '')
  if (!/^\d+$/.test(contact)) throw new Error('activecampaign_contact_missing')
  const lists = await api(`contacts/${contact}/contactLists?limit=100`)
  if (!Array.isArray(lists.contactLists) || !lists.contactLists.some((entry:any)=>String(entry.status)==='1')) {
    // Do not resubscribe people or report a delivery that AC would suppress.
    throw new Error('activecampaign_contact_not_subscribed')
  }
  const tag = String(matchingTags[0].id)
  // A tag is only added after the personal link has been accepted by the provider.
  // Existing membership means a retry must not re-enter the automation.
  for (let offset = 0; ; offset += 100) {
    const result = await api(`contacts/${contact}/contactTags?limit=100&offset=${offset}`)
    if (!Array.isArray(result.contactTags)) throw new Error('activecampaign_tags_invalid')
    if (result.contactTags.some((entry: any) => String(entry.tag) === tag)) return contact
    if (result.contactTags.length < 100) break
    if (offset >= 10000) throw new Error('activecampaign_tags_limit')
  }
  await api('contactTags', { contactTag: { contact, tag } })
  return contact
}
