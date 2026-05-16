import { z } from 'zod';
import { createUserClient } from '@/lib/supabase';
import {
  ok, created, err, serverError, unauthorized, extractBearerToken,
} from '@/lib/api-response';

const CreateSubscriptionSchema = z.object({
  farmer_id:   z.string().uuid('farmer_id must be a valid UUID.'),
  crop_name:   z.string().min(1, 'crop_name is required.').trim(),
  quantity_kg: z.number().positive('quantity_kg must be positive.'),
  frequency:   z.enum(['weekly', 'biweekly', 'monthly']).default('weekly'),
});

// ── GET /api/subscriptions ────────────────────────────────────────────────────
// Consumer: their active subscriptions (with farmer info).
// Farmer: consumers subscribed to them.
// Query params: ?status=active&crop_name=tomato
export async function GET(request: Request): Promise<Response> {
  const token = extractBearerToken(request);
  if (!token) return unauthorized();

  const { searchParams } = new URL(request.url);
  const status    = searchParams.get('status') ?? 'active';
  const crop_name = searchParams.get('crop_name');

  const supabase = createUserClient(token);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return unauthorized();

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', authData.user.id).single();

  let query = supabase
    .from('subscriptions')
    .select(`
      *,
      consumer:profiles!consumer_id(full_name, location),
      farmer:profiles!farmer_id(full_name, location, phone)
    `)
    .order('created_at', { ascending: false });

  if (profile?.role === 'farmer') {
    query = query.eq('farmer_id', authData.user.id);
  } else {
    query = query.eq('consumer_id', authData.user.id);
  }

  if (status)    query = query.eq('status', status);
  if (crop_name) query = query.ilike('crop_name', `%${crop_name}%`);

  const { data, error } = await query;
  if (error) return serverError(error.message);

  return ok({ subscriptions: data });
}

// ── POST /api/subscriptions ───────────────────────────────────────────────────
// Protected: only consumers can subscribe.
export async function POST(request: Request): Promise<Response> {
  const token = extractBearerToken(request);
  if (!token) return unauthorized();

  let body: unknown;
  try { body = await request.json(); }
  catch { return err('Invalid JSON body.'); }

  const parsed = CreateSubscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.errors.map(e => e.message).join(' '), 422);
  }

  const supabase = createUserClient(token);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return unauthorized();

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', authData.user.id).single();
  if (!profile || profile.role !== 'consumer') {
    return err('Only consumers can create subscriptions.', 403);
  }

  // Verify target is a farmer
  const { data: farmer } = await supabase
    .from('profiles').select('role').eq('id', parsed.data.farmer_id).single();
  if (!farmer || farmer.role !== 'farmer') {
    return err('The specified farmer_id does not belong to a farmer.', 400);
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({ ...parsed.data, consumer_id: authData.user.id })
    .select()
    .single();

  if (error) return serverError(error.message);
  return created(data);
}
