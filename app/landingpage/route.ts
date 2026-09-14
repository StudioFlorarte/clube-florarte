import { landingHtml } from '@/lib/landingpage-html';
import { createVisitToken } from '@/lib/landing-visit-token';
export const dynamic = 'force-dynamic';
export function GET() {
  let token = '';
  try { token = createVisitToken(); } catch { console.error('Landing visit tracking unavailable'); }
  return new Response(landingHtml.replace('__VISIT_TOKEN__', token), {headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}});
}

