import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Copy .env.example → .env.local and fill in your project credentials.'
  );
}

/**
 * Admin client — uses the service role key.
 * Bypasses Row Level Security. Use only in trusted server contexts
 * (e.g. creating profiles, admin operations).
 * NEVER expose this client to the browser.
 */
export function createServerClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * User-scoped client — uses the caller's JWT access token.
 * Row Level Security is fully enforced. Use this for all
 * user-facing CRUD operations so RLS policies apply.
 */
export function createUserClient(accessToken: string): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Public client — uses the anon key without a token.
 * Use this for public read routes where RLS allows anonymous access.
 */
export function createAnonClient(): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Verify a raw JWT access token and return the Supabase user object.
 * Returns null if the token is missing, expired, or invalid.
 */
export async function verifyToken(
  accessToken: string
): Promise<{ id: string; email?: string } | null> {
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return { id: data.user.id, email: data.user.email };
}
