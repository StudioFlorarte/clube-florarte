// The previous public address remains valid for invitations already sent.
// Compare exact origins; never trust Host or X-Forwarded-Host for redirects.
export function trustedAppOrigin(origin: string | null, requestUrl: string, configuredUrl = process.env.APP_URL): string | null {
  if (!origin) return null
  const primary = new URL(configuredUrl || requestUrl).origin
  const legacy = 'https://sensational-biscochitos-5c177c.netlify.app'
  return origin === primary || origin === legacy ? origin : null
}
