import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createUserClient, createAnonClient } from '@/lib/supabase';
import {
  ok, created, err, serverError, unauthorized, extractBearerToken,
} from '@/lib/api-response';

const CreateDemandSchema = z.object({
  crop_name:   z.string().min(1, 'crop_name is required.').trim(),
  quantity_kg: z.number().positive('quantity_kg must be positive.'),
  needed_by:   z.string().optional(),   // ISO date string
  location:    z.string().optional(),
  notes:       z.string().optional(),
});

// ── GET /api/demands ──────────────────────────────────────────────────────────
// Public-ish: anyone with a token can browse demands.
// Query params: ?status=open&crop_name=tomato&location=Delhi&page=1&limit=20
export async function GET(request: NextRequest): Promise<Response> {
  const token = extractBearerToken(request);

  const { searchParams } = new URL(request.url);
  const status    = searchParams.get('status')    ?? 'open';
  const crop_name = searchParams.get('crop_name');
  const location  = searchParams.get('location');
  const page      = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit     = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? '20')));
  const from      = (page - 1) * limit;

  const supabase = token ? createUserClient(token) : createAnonClient();

  let query = supabase
    .from('demands')
    .select(`
      *,
      profile:profiles!consumer_id(full_name, location)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  if (status) query = query.eq('status', status);
  if (crop_name) query = query.ilike('crop_name', `%${crop_name}%`);
  if (location) query = query.ilike('location', `%${location}%`);

  const { data, error, count } = await query;
  if (error) return serverError(error.message);

  return ok({ demands: data, total: count, page, limit });
}

// ── POST /api/demands ─────────────────────────────────────────────────────────
// Protected: only consumers can post demands.
export async function POST(request: NextRequest): Promise<Response> {
  const token = extractBearerToken(request);
  if (!token) return unauthorized();

  let body: unknown;
  try { body = await request.json(); }
  catch { return err('Invalid JSON body.'); }

  const parsed = CreateDemandSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.errors.map(e => e.message).join(' '), 422);
  }

  const supabase = createUserClient(token);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return unauthorized();

  // Verify role
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', authData.user.id).single();
  if (!profile || profile.role === 'farmer') {
    return err('Only consumers can post demands.', 403);
  }

  const { data, error } = await supabase
    .from('demands')
    .insert({ ...parsed.data, consumer_id: authData.user.id })
    .select()
    .single();

  if (error) return serverError(error.message);
  return created(data);
}
