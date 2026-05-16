import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';
import { ok, err, serverError } from '@/lib/api-response';

const SigninSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err('Request body must be valid JSON.');
  }

  const parsed = SigninSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.errors.map((e) => e.message).join(' '), 422);
  }

  const { email, password } = parsed.data;
  const supabase = createServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Supabase returns "Invalid login credentials" for wrong email/password
    if (error.message.toLowerCase().includes('invalid')) {
      return err('Invalid email or password.', 401);
    }
    return serverError(error.message);
  }

  const { user, session } = data;

  // Fetch profile to include role in response
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role, location')
    .eq('id', user.id)
    .single();

  return ok({
    user: {
      id: user.id,
      email: user.email,
      full_name: profile?.full_name ?? null,
      role: profile?.role ?? null,
      location: profile?.location ?? null,
    },
    session: {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
    },
  });
}
