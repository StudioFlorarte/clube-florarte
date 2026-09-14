import { NextRequest, NextResponse } from 'next/server';
import { validVisitToken } from '@/lib/landing-visit-token';
import { createAdminClient } from '@/lib/supabase/admin';
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const allowed = new Set([request.nextUrl.origin, 'https://studioflorarte.com', 'https://www.studioflorarte.com']);
  if (!origin || !allowed.has(origin)) return new NextResponse(null, {status:403});
  if (Number(request.headers.get('content-length') || 0) > 1024) return new NextResponse(null, {status:413});
  try {
    const text = await request.text();
    if (text.length > 1024) return new NextResponse(null, {status:413});
    let body;
    try { body = JSON.parse(text); } catch { return new NextResponse(null,{status:400}); }
    if (!body || typeof body.visitId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.visitId) || !validVisitToken(body.token)) return new NextResponse(null,{status:400});
    const {error} = await createAdminClient().from('landing_page_visits').upsert({id:body.visitId},{onConflict:'id',ignoreDuplicates:true});
    if (error) { console.error('Landing visit could not be saved', error.code); return new NextResponse(null,{status:503}); }
    return new NextResponse(null,{status:204,headers:{'Cache-Control':'no-store'}});
  } catch { return new NextResponse(null,{status:503}); }
}

