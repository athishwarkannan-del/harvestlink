import { NextRequest } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@/lib/supabase';
import { created, err, serverError } from '@/lib/api-response';

const SignupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .regex(/[A-Za-z]/, { message: 'Password must contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number.' }),
  full_name: z.string().min(2, { message: 'Full name must be at least 2 characters.' }).trim(),
  role: z.enum(['consumer', 'farmer'], {
    errorMap: () => ({ message: 'Role must be "consumer" or "farmer".' }),
  }),
  location: z.string().optional(),
});

export async function POST(request: NextRequest): Promise<Response> {
  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return err('Request body must be valid JSON.');
  }

  // Validate
  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.errors.map((e) => e.message).join(' '), 422);
  }

  const { email, password, full_name, role, location } = parsed.data;

  const supabase = createServerClient();

  // Create auth user (Supabase will trigger handle_new_user → profiles row)
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip email confirmation for MVP
    user_metadata: { full_name, role, location: location ?? '' },
  });

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return err('An account with this email already exists.', 409);
    }
    return serverError(error.message);
  }

  // Sign in immediately to return a session
  const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (sessionError || !sessionData.session) {
    // User created but couldn't auto-sign-in — return partial success
    return created({ user: data.user, session: null });
  }

  return created({
    user: {
      id: data.user.id,
      email: data.user.email,
      full_name,
      role,
    },
    session: {
      access_token: sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
      expires_at: sessionData.session.expires_at,
    },
  });
}
