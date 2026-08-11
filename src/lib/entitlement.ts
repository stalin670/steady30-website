import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Reads Steady30 Plus for the signed-in member.
 *
 * The web has no RevenueCat SDK, so this reads the mirror written by the
 * revenuecat-webhook edge function (see
 * ../Steady30/supabase/migrations/20260811000002_plus_entitlements.sql).
 *
 * Two deliberate choices:
 *
 *   - No row means free. A member who never subscribed simply has no row, and
 *     that is not an error condition.
 *
 *   - A failed lookup ALSO returns free rather than throwing. Weekly Review is
 *     the only gated feature and the locked state is informative, so a database
 *     hiccup degrades to "locked with an explanation" instead of a 500 on a page
 *     someone opened to look at their own week.
 */
export const getPlusStatus = async (supabase: SupabaseClient): Promise<boolean> => {
  const { data, error } = await supabase.rpc('is_plus_active');
  if (error) return false;
  return data === true;
};
