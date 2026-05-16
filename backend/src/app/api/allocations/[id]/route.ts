import { z } from 'zod';
import { createUserClient } from '@/lib/supabase';
import {
  ok, err, notFound, serverError, unauthorized, forbidden, extractBearerToken,
} from '@/lib/api-response';

const UpdateAllocationSchema = z.object({
  status:       z.enum(['confirmed', 'rejected', 'cancelled']).optional(),
  allocated_kg: z.number().positive().optional(),
  price_per_kg: z.number().min(0).optional(),
  message:      z.string().optional(),
});

// GET /api/allocations/[id]
export async function GET(
  request: Request,
  ctx: RouteContext<'/api/allocations/[id]'>
): Promise<Response> {
  const token = extractBearerToken(request);
  if (!token) return unauthorized();

  const { id } = await ctx.params;
  const supabase = createUserClient(token);

  const { data, error } = await supabase
    .from('allocations')
    .select(`
      *,
      demand:demands(crop_name, quantity_kg, needed_by, location, consumer_id),
      farmer:profiles!farmer_id(full_name, location, phone)
    `)
    .eq('id', id)
    .single();

  if (error || !data) return notFound('Allocation');
  return ok(data);
}

// PUT /api/allocations/[id]
// Farmer can update their own allocation details.
// Consumer (demand owner) can confirm or reject an allocation.
export async function PUT(
  request: Request,
  ctx: RouteContext<'/api/allocations/[id]'>
): Promise<Response> {
  const token = extractBearerToken(request);
  if (!token) return unauthorized();

  const { id } = await ctx.params;

  let body: unknown;
  try { body = await request.json(); }
  catch { return err('Invalid JSON body.'); }

  const parsed = UpdateAllocationSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.errors.map(e => e.message).join(' '), 422);
  }

  const supabase = createUserClient(token);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return unauthorized();

  // Step 1: fetch allocation (farmer_id + demand_id only — avoids Supabase join type issues)
  const { data: allocation } = await supabase
    .from('allocations')
    .select('farmer_id, demand_id')
    .eq('id', id)
    .single();

  if (!allocation) return notFound('Allocation');

  // Step 2: fetch demand owner separately
  const { data: demand } = await supabase
    .from('demands')
    .select('consumer_id')
    .eq('id', allocation.demand_id)
    .single();

  const demandConsumerId: string | null = demand?.consumer_id ?? null;
  const isFarmer   = (allocation.farmer_id as string) === authData.user.id;
  const isConsumer = demandConsumerId === authData.user.id;

  if (!isFarmer && !isConsumer) return forbidden();

  // Consumer may only change status; farmer may update offer details
  if (isConsumer && !isFarmer) {
    const allowed: string[] = ['confirmed', 'rejected'];
    if (parsed.data.status && !allowed.includes(parsed.data.status)) {
      return err('Consumers may only set status to "confirmed" or "rejected".', 422);
    }
    // Strip non-status fields for consumer
    const consumerUpdate: Record<string, unknown> = {};
    if (parsed.data.status) consumerUpdate.status = parsed.data.status;
    const { data, error } = await supabase
      .from('allocations').update(consumerUpdate).eq('id', id).select().single();
    if (error) return serverError(error.message);
    return ok(data);
  }

  // Farmer update — all fields allowed
  const { data, error } = await supabase
    .from('allocations').update(parsed.data).eq('id', id).select().single();

  if (error) return serverError(error.message);
  return ok(data);
}
