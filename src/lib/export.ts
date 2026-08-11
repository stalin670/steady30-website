import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Web port of ../Steady30/src/lib/export.ts.
 *
 * NOT a byte-copy — the app version imports expo-file-system and expo-sharing.
 * The query set below must stay identical to the app's, or the two clients hand
 * a member different answers to the same GDPR access request. If you add a table
 * there, add it here in the same commit.
 */
export interface UserExportData {
  exportedAt: string;
  profile: unknown;
  attempts: unknown[];
  checkIns: unknown[];
  relapseEvents: unknown[];
  posts: unknown[];
  comments: unknown[];
  copingPlans: unknown[];
  challengePreferences: unknown;
  trustedConnections: unknown[];
  trustedSupportRequests: unknown[];
  completionReflections: unknown[];
  maintenancePreferences: unknown;
  maintenanceCheckIns: unknown[];
  peerGuideApplication: unknown;
  peerGuide: unknown;
}

export const fetchUserDataForExport = async (
  supabase: SupabaseClient,
  userId: string
): Promise<UserExportData> => {
  const [
    profile,
    attempts,
    checkIns,
    relapses,
    posts,
    comments,
    copingPlans,
    preferences,
    connections,
    supportRequests,
    completionExport,
    peerGuideExport
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('attempts').select('*').eq('user_id', userId),
    supabase.from('daily_checkins').select('*').eq('user_id', userId),
    supabase.from('relapse_events').select('*').eq('user_id', userId),
    supabase.from('posts').select('*').eq('author_id', userId),
    supabase.from('comments').select('*').eq('author_id', userId),
    supabase.from('coping_plans').select('*').eq('user_id', userId),
    supabase.from('challenge_preferences').select('*').eq('user_id', userId).maybeSingle(),
    supabase
      .from('trusted_connections')
      .select('*')
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`),
    supabase
      .from('trusted_support_requests')
      .select('*')
      .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`),
    supabase.rpc('get_completion_export_data'),
    supabase.rpc('get_peer_guide_export_data')
  ]);

  // A partial export would silently under-report someone's own data, which is
  // worse than failing loudly on an access request.
  const failure = [
    profile,
    attempts,
    checkIns,
    relapses,
    posts,
    comments,
    copingPlans,
    preferences,
    connections,
    supportRequests,
    completionExport,
    peerGuideExport
  ].find((result) => result.error)?.error;
  if (failure) throw failure;

  return {
    exportedAt: new Date().toISOString(),
    profile: profile.data,
    attempts: attempts.data ?? [],
    checkIns: checkIns.data ?? [],
    relapseEvents: relapses.data ?? [],
    posts: posts.data ?? [],
    comments: comments.data ?? [],
    copingPlans: copingPlans.data ?? [],
    challengePreferences: preferences.data ?? null,
    trustedConnections: connections.data ?? [],
    trustedSupportRequests: supportRequests.data ?? [],
    completionReflections: completionExport.data?.completion_reflections ?? [],
    maintenancePreferences: completionExport.data?.maintenance_preferences ?? null,
    maintenanceCheckIns: completionExport.data?.maintenance_checkins ?? [],
    peerGuideApplication: peerGuideExport.data?.application ?? null,
    peerGuide: peerGuideExport.data?.guide ?? null
  };
};

/** Browser download. The file never leaves the device by any other route. */
export const downloadExportJson = (
  data: UserExportData,
  filename = 'steady30-data-export.json'
) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
