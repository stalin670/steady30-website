import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Publishable key only — AGENTS.md forbids a service-role key reaching any client
// bundle, and a Server Component still counts as one bad import away from it.
export const supabaseEnv = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
};

/**
 * Request-scoped client for Server Components and Route Handlers.
 *
 * Returns null when Supabase is not configured. Phase 1 is the public marketing
 * surface, so it has to render on a machine with no credentials at all rather
 * than crash the whole site on a missing env var.
 */
export const createClient = async () => {
  const env = supabaseEnv();
  if (!env) return null;

  const cookieStore = await cookies();

  return createServerClient(env.url, env.key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only. The
          // middleware refreshes the session instead, so this is safe to ignore.
        }
      }
    }
  });
};
