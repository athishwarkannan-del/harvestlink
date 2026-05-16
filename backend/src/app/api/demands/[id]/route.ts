import { z } from 'zod';
import { createUserClient } from '@/lib/supabase';
import {
  ok, err, notFound, serverError, unauthorized, forbidden, extractBearerToken,
} from '@/lib/api-response';

const UpdateDemandSchema = z.object({
  crop_name:   z.string().min(1).trim().optional(),
  quantity_kg: z.number().positive().optional(),
  needed_by:   z.string().optional(),
  location:    z.string().optional(),
  notes:       z.string().optional(),
  status:      z.enum(['open', 'partially_fulfilled', 'fulfilled', 'cancelled']).optional(),
});

// ── GET /api/demands/[id] ─────────────────────────────────────────────────────
export async function GET(
  request: Request,
  ctx: RouteContext<'/api/demands/[id]'>
): Promise<Response> {
  const token = extractBearerToken(request);
  if (!token) return unauthorized();

  const { id } = await ctx.params;
  const supabase = createUserClient(token);

  const { data, error } = await supabase
    .from('demands')
    .select(`
      *,
      profile:profiles!consumer_id(full_name, location),
      allocations(
        id, farmer_id, allocated_kg, price_per_kg, message, status, created_at,
        farmer:profiles!farmer_id(full_name, location)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !data) return notFound('Demand');
  return ok(data);
}

// ── PUT /api/demands/[id] ─────────────────────────────────────────────────────
export async function PUT(
  request: Request,
  ctx: RouteContext<'/api/demands/[id]'>
): Promise<Response> {
  const token = extractBearerToken(request);
  if (!token) return unauthorized();

  const { id } = await ctx.params;

  let body: unknown;
  try { body = await request.json(); }
  catch { return err('Invalid JSON body.'); }

  const parsed = UpdateDemandSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.errors.map(e => e.message).join(' '), 422);
  }

  const supabase = createUserClient(token);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return unauthorized();

  // RLS will reject if not owner; still provide a helpful error
  const { data: existing } = await supabase
    .from('demands').select('consumer_id').eq('id', id).single();
  if (!existing) return notFound('Demand');
  if (existing.consumer_id !== authData.user.id) return forbidden();

  const { data, error } = await supabase
    .from('demands').update(parsed.data).eq('id', id).select().single();

  if (error) return serverError(error.message);
  return ok(data);
}

// ── DELETE /api/demands/[id] ──────────────────────────────────────────────────
export async function DELETE(
  request: Request,
  ctx: RouteContext<'/api/demands/[id]'>
): Promise<Response> {
  const token = extractBearerToken(request);
  if (!token) return unauthorized();

  const { id } = await ctx.params;
  const supabase = createUserClient(token);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return unauthorized();

  const { data: existing } = await supabase
    .from('demands').select('consumer_id').eq('id', id).single();
  if (!existing) return notFound('Demand');
  if (existing.consumer_id !== authData.user.id) return forbidden();

  // Soft-delete via status update
  const { error } = await supabase
    .from('demands').update({ status: 'cancelled' }).eq('id', id);

  if (error) return serverError(error.message);
  return ok({ message: 'Demand cancelled successfully.' });
}
