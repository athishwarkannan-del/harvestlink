import { z } from 'zod';
import { createUserClient } from '@/lib/supabase';
import {
  ok, err, notFound, serverError, unauthorized, forbidden, extractBearerToken,
} from '@/lib/api-response';

const UpdateSubscriptionSchema = z.object({
  quantity_kg: z.number().positive().optional(),
  frequency:   z.enum(['weekly', 'biweekly', 'monthly']).optional(),
  status:      z.enum(['active', 'paused', 'cancelled']).optional(),
});

// GET /api/subscriptions/[id]
export async function GET(
  request: Request,
  ctx: RouteContext<'/api/subscriptions/[id]'>
): Promise<Response> {
  const token = extractBearerToken(request);
  if (!token) return unauthorized();
  const { id } = await ctx.params;
  const supabase = createUserClient(token);

  const { data, error } = await supabase
    .from('subscriptions')
    .select(`*, consumer:profiles!consumer_id(full_name, location), farmer:profiles!farmer_id(full_name, location, phone)`)
    .eq('id', id)
    .single();

  if (error || !data) return notFound('Subscription');
  return ok(data);
}

// PUT /api/subscriptions/[id]
export async function PUT(
  request: Request,
  ctx: RouteContext<'/api/subscriptions/[id]'>
): Promise<Response> {
  const token = extractBearerToken(request);
  if (!token) return unauthorized();
  const { id } = await ctx.params;

  let body: unknown;
  try { body = await request.json(); }
  catch { return err('Invalid JSON body.'); }

  const parsed = UpdateSubscriptionSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.errors.map(e => e.message).join(' '), 422);

  const supabase = createUserClient(token);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return unauthorized();

  const { data: existing } = await supabase
    .from('subscriptions').select('consumer_id').eq('id', id).single();
  if (!existing) return notFound('Subscription');
  if (existing.consumer_id !== authData.user.id) return forbidden();

  const { data, error } = await supabase
    .from('subscriptions').update(parsed.data).eq('id', id).select().single();

  if (error) return serverError(error.message);
  return ok(data);
}

// DELETE /api/subscriptions/[id] — soft cancel
export async function DELETE(
  request: Request,
  ctx: RouteContext<'/api/subscriptions/[id]'>
): Promise<Response> {
  const token = extractBearerToken(request);
  if (!token) return unauthorized();
  const { id } = await ctx.params;

  const supabase = createUserClient(token);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return unauthorized();

  const { data: existing } = await supabase
    .from('subscriptions').select('consumer_id').eq('id', id).single();
  if (!existing) return notFound('Subscription');
  if (existing.consumer_id !== authData.user.id) return forbidden();

  const { error } = await supabase
    .from('subscriptions').update({ status: 'cancelled' }).eq('id', id);
  if (error) return serverError(error.message);

  return ok({ message: 'Subscription cancelled successfully.' });
}
