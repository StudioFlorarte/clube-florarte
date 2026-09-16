import { NextRequest } from 'next/server';
import { landingHtml } from '@/lib/landingpage-html';
import { createVisitToken } from '@/lib/landing-visit-token';
import { landingOptions, renderLanding, renderLandingSelector } from '@/lib/landingpage-locales';
export const dynamic = 'force-dynamic';
export function GET(request: NextRequest) {
  const option = landingOptions[request.nextUrl.searchParams.get('view') || ''];
  if (!option) return new Response(renderLandingSelector(), {headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store'}});
  let token = '';
  try { token = createVisitToken(); } catch { console.error('Landing visit tracking unavailable'); }
  return new Response(renderLanding(landingHtml.replace('__VISIT_TOKEN__', token), option), {headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}});
}

