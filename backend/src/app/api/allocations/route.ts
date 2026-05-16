import { z } from 'zod';
import { createUserClient } from '@/lib/supabase';
import {
  ok, created, err, serverError, unauthorized, extractBearerToken,
} from '@/lib/api-response';

const CreateAllocationSchema = z.object({
  demand_id:     z.string().uuid('demand_id must be a valid UUID.'),
  allocated_kg:  z.number().positive('allocated_kg must be positive.'),
  price_per_kg:  z.number().min(0, 'price_per_kg cannot be negative.'),
  message:       z.string().optional(),
});

// ── GET /api/allocations ──────────────────────────────────────────────────────
// Farmer: sees their own allocations.
// Consumer: sees allocations on their demands.
// Query params: ?demand_id=<uuid>&status=pending
export async function GET(request: Request): Promise<Response> {
  const token = extractBearerToken(request);
  if (!token) return unauthorized();

  const { searchParams } = new URL(request.url);
  const demand_id = searchParams.get('demand_id');
  const status    = searchParams.get('status');

  const supabase = createUserClient(token);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return unauthorized();

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', authData.user.id).single();

  let query = supabase
    .from('allocations')
    .select(`
      *,
      demand:demands(crop_name, quantity_kg, needed_by, location, status),
      farmer:profiles!farmer_id(full_name, location)
    `)
    .order('created_at', { ascending: false });

  // Filter by perspective
  if (profile?.role === 'farmer') {
    query = query.eq('farmer_id', authData.user.id);
  } else {
    // Consumer: see allocations only on their demands
    query = query.eq('demands.consumer_id', authData.user.id);
  }

  if (demand_id) query = query.eq('demand_id', demand_id);
  if (status)    query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return serverError(error.message);

  return ok({ allocations: data });
}

// ── POST /api/allocations ─────────────────────────────────────────────────────
// Protected: only farmers can create allocations.
export async function POST(request: Request): Promise<Response> {
  const token = extractBearerToken(request);
  if (!token) return unauthorized();

  let body: unknown;
  try { body = await request.json(); }
  catch { return err('Invalid JSON body.'); }

  const parsed = CreateAllocationSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.errors.map(e => e.message).join(' '), 422);
  }

  const supabase = createUserClient(token);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return unauthorized();

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', authData.user.id).single();
  if (!profile || profile.role !== 'farmer') {
    return err('Only farmers can create allocations.', 403);
  }

  // Confirm demand exists and is open
  const { data: demand } = await supabase
    .from('demands').select('status').eq('id', parsed.data.demand_id).single();
  if (!demand) return err('Demand not found.', 404);
  if (demand.status === 'cancelled' || demand.status === 'fulfilled') {
    return err(`Cannot allocate to a demand with status "${demand.status}".`, 409);
  }

  const { data, error } = await supabase
    .from('allocations')
    .insert({ ...parsed.data, farmer_id: authData.user.id })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return err('You have already submitted an allocation for this demand.', 409);
    }
    return serverError(error.message);
  }

  return created(data);
}
