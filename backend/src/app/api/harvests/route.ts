import { z } from 'zod';
import { createUserClient, createAnonClient } from '@/lib/supabase';
import {
  ok, created, err, serverError, unauthorized, extractBearerToken,
} from '@/lib/api-response';

const CreateHarvestSchema = z.object({
  crop_name:    z.string().min(1, 'crop_name is required.').trim(),
  field_name:   z.string().optional(),
  estimated_kg: z.number().positive().optional(),
  harvest_date: z.string().optional(),
  notes:        z.string().optional(),
  status:       z.enum(['growing', 'ready', 'harvested', 'sold']).default('growing'),
});

// GET /api/harvests
// Farmer: their own harvests. Consumer: all harvests (public catalogue).
// Query params: ?status=ready&crop_name=wheat&farmer_id=<uuid>
export async function GET(request: Request): Promise<Response> {
  const token = extractBearerToken(request);

  const { searchParams } = new URL(request.url);
  const status    = searchParams.get('status');
  const crop_name = searchParams.get('crop_name');
  const farmer_id = searchParams.get('farmer_id');
  const page  = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') ?? '20')));
  const from  = (page - 1) * limit;

  const supabase = token ? createUserClient(token) : createAnonClient();
  let userRole: string | null = null;
  let userId: string | null = null;

  if (token) {
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      userId = authData.user.id;
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', userId).single();
      userRole = profile?.role || null;
    }
  }

  let query = supabase
    .from('harvests')
    .select(`*, farmer:profiles!farmer_id(full_name, location)`, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1);

  // Farmers only see their own harvests by default
  if (userRole === 'farmer' && userId) {
    query = query.eq('farmer_id', userId);
  } else if (farmer_id) {
    query = query.eq('farmer_id', farmer_id);
  }

  if (status)    query = query.eq('status', status);
  if (crop_name) query = query.ilike('crop_name', `%${crop_name}%`);

  const { data, error, count } = await query;
  if (error) return serverError(error.message);

  return ok({ harvests: data, total: count, page, limit });
}

// POST /api/harvests — farmer logs a new harvest record
export async function POST(request: Request): Promise<Response> {
  const token = extractBearerToken(request);
  if (!token) return unauthorized();

  let body: unknown;
  try { body = await request.json(); }
  catch { return err('Invalid JSON body.'); }

  const parsed = CreateHarvestSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.errors.map(e => e.message).join(' '), 422);

  const supabase = createUserClient(token);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return unauthorized();

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', authData.user.id).single();
  if (!profile || profile.role !== 'farmer') {
    return err('Only farmers can log harvests.', 403);
  }

  const { data, error } = await supabase
    .from('harvests')
    .insert({ ...parsed.data, farmer_id: authData.user.id })
    .select()
    .single();

  if (error) return serverError(error.message);
  return created(data);
}
