import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';

export type SessionProfile = {
  id: string;
  handle: string | null;
  display_name: string | null;
  preferred_timezone: string | null;
  role: 'member' | 'moderator' | 'admin';
  is_suspended: boolean;
};

/**
 * The authenticated-route gate.
 *
 * This is a convenience, not the security boundary — RLS is. It exists so a
 * signed-out visitor lands on sign-in instead of an empty screen, and so a
 * half-onboarded account cannot reach a page that assumes a handle exists.
 *
 * `getUser()` rather than `getSession()`: the former revalidates with the auth
 * server, the latter trusts a cookie the client could have written.
 */
export const requireMember = async ({
  allowMissingProfile = false
}: { allowMissingProfile?: boolean } = {}) => {
  const supabase = await createClient();
  if (!supabase) redirect('/sign-in');

  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/sign-in');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, handle, display_name, preferred_timezone, role, is_suspended')
    .eq('id', user.id)
    .maybeSingle<SessionProfile>();

  if (!profile?.handle && !allowMissingProfile) redirect('/onboarding');

  return { supabase, user, profile: profile ?? null };
};

/**
 * Gate for the moderation console.
 *
 * This is convenience, not enforcement: every admin RPC re-checks the caller's
 * role server-side and RLS restricts the tables underneath. A member who forced
 * their way past this would see empty queues and get ADMIN_REQUIRED from every
 * action — the gate exists so staff-only navigation does not appear for everyone.
 */
export const requireStaff = async ({ adminOnly = false }: { adminOnly?: boolean } = {}) => {
  const session = await requireMember();
  const role = session.profile?.role;

  const allowed = adminOnly ? role === 'admin' : role === 'admin' || role === 'moderator';
  if (!allowed) redirect('/today');

  return { ...session, role: role! };
};
