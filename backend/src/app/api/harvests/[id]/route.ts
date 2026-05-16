import { z } from 'zod';
import { createUserClient } from '@/lib/supabase';
import {
  ok, err, notFound, serverError, unauthorized, forbidden, extractBearerToken,
} from '@/lib/api-response';

const UpdateHarvestSchema = z.object({
  crop_name:    z.string().min(1).trim().optional(),
  field_name:   z.string().optional(),
  estimated_kg: z.number().positive().optional(),
  actual_kg:    z.number().min(0).optional(),
  harvest_date: z.string().optional(),
  notes:        z.string().optional(),
  status:       z.enum(['growing', 'ready', 'harvested', 'sold']).optional(),
});

// GET /api/harvests/[id]
export async function GET(
  request: Request,
  ctx: RouteContext<'/api/harvests/[id]'>
): Promise<Response> {
  const token = extractBearerToken(request);
  if (!token) return unauthorized();

  const { id } = await ctx.params;
  const supabase = createUserClient(token);

  const { data, error } = await supabase
    .from('harvests')
    .select(`*, farmer:profiles!farmer_id(full_name, location, phone)`)
    .eq('id', id)
    .single();

  if (error || !data) return notFound('Harvest');
  return ok(data);
}

// PUT /api/harvests/[id] — farmer updates their harvest record
export async function PUT(
  request: Request,
  ctx: RouteContext<'/api/harvests/[id]'>
): Promise<Response> {
  const token = extractBearerToken(request);
  if (!token) return unauthorized();

  const { id } = await ctx.params;

  let body: unknown;
  try { body = await request.json(); }
  catch { return err('Invalid JSON body.'); }

  const parsed = UpdateHarvestSchema.safeParse(body);
  if (!parsed.success) return err(parsed.error.errors.map(e => e.message).join(' '), 422);

  const supabase = createUserClient(token);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return unauthorized();

  const { data: existing } = await supabase
    .from('harvests').select('farmer_id').eq('id', id).single();
  if (!existing) return notFound('Harvest');
  if (existing.farmer_id !== authData.user.id) return forbidden();

  const { data, error } = await supabase
    .from('harvests').update(parsed.data).eq('id', id).select().single();

  if (error) return serverError(error.message);
  return ok(data);
}

// DELETE /api/harvests/[id] — farmer removes a harvest record
export async function DELETE(
  request: Request,
  ctx: RouteContext<'/api/harvests/[id]'>
): Promise<Response> {
  const token = extractBearerToken(request);
  if (!token) return unauthorized();

  const { id } = await ctx.params;
  const supabase = createUserClient(token);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return unauthorized();

  const { data: existing } = await supabase
    .from('harvests').select('farmer_id').eq('id', id).single();
  if (!existing) return notFound('Harvest');
  if (existing.farmer_id !== authData.user.id) return forbidden();

  const { error } = await supabase.from('harvests').delete().eq('id', id);
  if (error) return serverError(error.message);

  return ok({ message: 'Harvest record deleted.' });
}
