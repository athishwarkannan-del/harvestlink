import { extractBearerToken, ok, serverError, unauthorized } from '@/lib/api-response';
import { createUserClient } from '@/lib/supabase';

// POST /api/auth/signout
// Protected — requires valid Bearer token
export async function POST(request: Request): Promise<Response> {
  const token = extractBearerToken(request);
  if (!token) return unauthorized();

  const supabase = createUserClient(token);
  const { error } = await supabase.auth.signOut();

  if (error) return serverError(error.message);

  return ok({ message: 'Signed out successfully.' });
}
