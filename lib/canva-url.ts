export function isCanvaUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && (
      url.hostname === 'canva.com' ||
      url.hostname.endsWith('.canva.com') ||
      url.hostname === 'canva.link'
    )
  } catch {
    return false
  }
}
