import { extractBearerToken, ok, notFound, serverError, unauthorized } from '@/lib/api-response';
import { createUserClient } from '@/lib/supabase';

// GET /api/auth/me
// Protected — returns the authenticated user's profile
export async function GET(request: Request): Promise<Response> {
  const token = extractBearerToken(request);
  if (!token) return unauthorized();

  const supabase = createUserClient(token);

  // Get the authenticated user from Supabase
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return unauthorized();

  // Fetch full profile from profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError) return serverError(profileError.message);
  if (!profile) return notFound('Profile');

  return ok({
    id: authData.user.id,
    email: authData.user.email,
    ...profile,
  });
}

// PUT /api/auth/me
// Protected — update the authenticated user's profile
export async function PUT(request: Request): Promise<Response> {
  const token = extractBearerToken(request);
  if (!token) return unauthorized();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 });
  }

  const supabase = createUserClient(token);
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return unauthorized();

  // Only allow safe fields to be updated
  const { full_name, location, phone, bio } = body as Record<string, string>;
  const updates: Record<string, string> = {};
  if (full_name !== undefined) updates.full_name = full_name;
  if (location !== undefined) updates.location = location;
  if (phone !== undefined) updates.phone = phone;
  if (bio !== undefined) updates.bio = bio;

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', authData.user.id)
    .select()
    .single();

  if (error) return serverError(error.message);

  return ok(profile);
}
