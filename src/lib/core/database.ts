export type AppRole = 'member' | 'moderator' | 'admin';

export type AttemptStatus =
  'pending' | 'active' | 'completed' | 'relapse' | 'missed_checkin' | 'withdrawn';

export type EndReason =
  | 'completed_30'
  | 'self_reported_relapse'
  | 'missed_deadline'
  | 'user_withdrew'
  | 'admin_correction';

export type ModerationStatus = 'pending' | 'published' | 'hidden' | 'rejected' | 'removed';

export type ContentKind = 'lesson' | 'exercise' | 'safety_resource';

export type ReportReason =
  | 'explicit_sexual_content'
  | 'harassment'
  | 'hate'
  | 'self_harm'
  | 'spam'
  | 'contact_solicitation'
  | 'misinformation'
  | 'other';

export type ReactionKind = 'support' | 'proud' | 'helpful' | 'relatable';

export interface ProfileRow {
  id: string;
  handle: string;
  display_name: string | null;
  bio: string | null;
  role: AppRole;
  is_suspended: boolean;
  leaderboard_opt_in: boolean;
  profile_visibility: 'members' | 'public' | 'private';
  terms_version: string;
  guidelines_version: string;
  privacy_version: string;
  accepted_at: string;
  adult_attested_at: string;
  preferred_timezone: string;
  created_at: string;
  updated_at: string;
}

export interface PublicProfile {
  id: string;
  handle: string;
  display_name: string | null;
  bio: string | null;
  role: AppRole;
  profile_visibility: 'members' | 'public' | 'private';
  leaderboard_opt_in: boolean;
  joined_at: string;
  completed_challenges_count: number;
  current_verified_streak: number;
  current_abstinence_streak: number;
}

export interface ChallengeRuleRow {
  version: string;
  title: string;
  definition: {
    title: string;
    target_days: number;
    abstinence_rules: string[];
    allowed_activities: string[];
    accountability_rules: string[];
  };
  target_days: number;
  is_active: boolean;
  created_at: string;
}

export interface AttemptRow {
  id: string;
  user_id: string;
  status: AttemptStatus;
  start_local_date: string;
  timezone: string;
  target_days: number;
  rule_version: string;
  rule_definition: Record<string, any>;
  started_at: string;
  ended_at: string | null;
  end_reason: EndReason | null;
  completed_days: number;
  last_on_time_local_date: string | null;
  next_deadline_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailyCheckInRow {
  id: string;
  attempt_id: string;
  user_id: string;
  local_date: string;
  day_number: number;
  mood: number;
  urge_intensity: number;
  trigger_categories: string[];
  coping_actions: string[];
  private_reflection: string;
  public_excerpt: string | null;
  is_public_opted_in: boolean;
  submitted_at: string;
  deadline_at: string;
  is_on_time: boolean;
  idempotency_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChallengePreferencesRow {
  user_id: string;
  goal_scope: 'pornography' | 'masturbation' | 'both';
  primary_reason: string;
  high_risk_windows: string[];
  trigger_categories: string[];
  support_style: 'private' | 'community' | 'balanced';
  created_at: string;
  updated_at: string;
}

export interface RelapseEventRow {
  id: string;
  attempt_id: string;
  user_id: string;
  occurred_at: string;
  categories: string[];
  private_note: string | null;
  idempotency_key: string | null;
  reversed_at: string | null;
  reversed_by: string | null;
  reversal_reason: string | null;
  created_at: string;
}

export type CommunityStage = 'starting' | 'building' | 'sustaining' | 'alumni';

export const COMMUNITY_STAGES = ['starting', 'building', 'sustaining', 'alumni'] as const;

export const COMMUNITY_STAGE_LABELS: Record<CommunityStage, string> = {
  starting: 'Starting',
  building: 'Building',
  sustaining: 'Sustaining',
  alumni: 'Alumni'
};

export interface PostRow {
  id: string;
  author_id: string;
  checkin_id: string | null;
  body: string;
  moderation_status: ModerationStatus;
  published_at: string | null;
  reaction_count: number;
  comment_count: number;
  edited_at: string | null;
  idempotency_key: string | null;
  community_stage: CommunityStage | null;
  created_at: string;
  updated_at: string;
}

export interface CommentRow {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  moderation_status: ModerationStatus;
  published_at: string | null;
  idempotency_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReactionRow {
  id: string;
  user_id: string;
  target_type: 'post' | 'comment';
  target_id: string;
  kind: ReactionKind;
  created_at: string;
}

export interface ReportRow {
  id: string;
  reporter_id: string;
  target_type: 'post' | 'comment' | 'profile';
  target_id: string;
  reason: ReportReason;
  detail: string | null;
  status: 'open' | 'reviewed' | 'dismissed' | 'actioned';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  response_due_at: string | null;
  first_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ModerationActionRow {
  id: string;
  actor_id: string | null;
  target_type: 'post' | 'comment' | 'profile';
  target_id: string;
  action:
    | 'hide'
    | 'reject'
    | 'remove'
    | 'publish'
    | 'suspend_user'
    | 'unsuspend_user'
    | 'dismiss_report'
    | 'role_change';
  reason_code: string;
  internal_note: string | null;
  previous_state: Record<string, any> | null;
  new_state: Record<string, any> | null;
  created_at: string;
}

export interface ContentItemRow {
  id: string;
  slug: string;
  kind: ContentKind;
  day_number: number | null;
  title: string;
  summary: string;
  body_markdown: string;
  estimated_minutes: number;
  source_urls: string[];
  review_status: 'draft' | 'reviewed';
  evidence_level: 'not_assessed' | 'limited' | 'emerging' | 'supported' | 'consensus';
  intended_outcome: string | null;
  limitations: string | null;
  reviewer_name: string | null;
  reviewer_credentials: string | null;
  reviewed_at: string | null;
  review_expires_at: string | null;
  published_at: string;
  version: string;
  created_at: string;
}

export interface TodayState {
  status: AttemptStatus | 'no_attempt';
  server_time: string;
  local_date?: string;
  day_number?: number;
  timezone?: string;
  open_at?: string;
  deadline_at?: string;
  abstinence_streak_days: number;
  verified_streak_days: number;
  attempt: AttemptRow | null;
  today_checkin: DailyCheckInRow | null;
  lesson: {
    id: string;
    slug: string;
    title: string;
    summary: string;
    day_number: number;
    estimated_minutes: number;
  } | null;
}

export interface CommunityFeedPost {
  id: string;
  author_id: string;
  author_handle: string;
  author_display_name: string | null;
  author_role: AppRole;
  body: string;
  moderation_status: ModerationStatus;
  published_at: string;
  reaction_count: number;
  comment_count: number;
  user_has_reacted: boolean;
  community_stage: CommunityStage | null;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  handle: string;
  display_name: string | null;
  verified_streak_days: number;
  last_on_time_local_date: string | null;
}

export type TrustedConnectionStatus = 'pending' | 'accepted' | 'declined' | 'revoked';

export type TrustedSupportRequestStatus = 'open' | 'acknowledged' | 'dismissed';

export interface TrustedConnectionRow {
  id: string;
  requester_id: string;
  recipient_id: string;
  requester_handle: string;
  recipient_handle: string;
  status: TrustedConnectionStatus;
  created_at: string;
  responded_at: string | null;
  revoked_at: string | null;
}

export interface TrustedSupportRequestRow {
  id: string;
  connection_id: string;
  sender_id: string;
  recipient_id: string;
  sender_handle: string;
  status: TrustedSupportRequestStatus;
  created_at: string;
  acknowledged_at: string | null;
}

export type CohortStatus = 'open' | 'active' | 'completed' | 'cancelled';

export type CohortMemberStatus = 'active' | 'left';

export type CohortIntention = 'return' | 'steady' | 'ask_for_encouragement';

export const COHORT_INTENTIONS = ['return', 'steady', 'ask_for_encouragement'] as const;

export const COHORT_INTENTION_LABELS: Record<CohortIntention, string> = {
  steady: 'Steady — moving forward as planned',
  return: 'Return — resetting and recommitting',
  ask_for_encouragement: 'Encouragement — working through challenges'
};

export interface CohortRow {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  status: CohortStatus;
  created_at: string;
  updated_at: string;
}

export interface CohortMemberRow {
  id: string;
  cohort_id: string;
  user_id: string;
  status: CohortMemberStatus;
  joined_at: string;
  left_at: string | null;
}

export interface CohortWeeklyPulseRow {
  id: string;
  cohort_member_id: string;
  week_starts_on: string;
  intention: CohortIntention;
  created_at: string;
  updated_at: string;
}

export interface OpenCohortSummary {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  member_count: number;
  spots_remaining: number;
}

export interface CohortRosterMember {
  user_id: string;
  handle: string;
  display_name: string | null;
  is_self: boolean;
}

export interface MyCohortState {
  membership: {
    id: string;
    status: CohortMemberStatus;
    joined_at: string;
  };
  cohort: {
    id: string;
    title: string;
    starts_at: string;
    ends_at: string;
    capacity: number;
    status: CohortStatus;
  };
  current_week_starts_on: string | null;
  current_week_number: number;
  roster: CohortRosterMember[];
  total_member_count: number;
  weekly_pulse_count: number;
  my_current_pulse: CohortIntention | null;
}

export type CohortAdminActionType = 'created' | 'activated' | 'completed' | 'cancelled';

export const COHORT_ADMIN_ACTION_TYPES = [
  'created',
  'activated',
  'completed',
  'cancelled'
] as const;

export type CohortAdminReasonCode = 'schedule' | 'low_enrollment' | 'safety' | 'routine_completion';

export const COHORT_ADMIN_REASON_CODES = [
  'schedule',
  'low_enrollment',
  'safety',
  'routine_completion'
] as const;

export const COHORT_ADMIN_REASON_LABELS: Record<CohortAdminReasonCode, string> = {
  schedule: 'Scheduled calendar progression',
  low_enrollment: 'Insufficient enrollment before start',
  safety: 'Safety or community guideline violation',
  routine_completion: 'Routine 30-day challenge completion'
};

export interface CohortAdminActionRow {
  id: string;
  cohort_id: string;
  actor_id: string;
  action: CohortAdminActionType;
  reason_code: CohortAdminReasonCode;
  created_at: string;
}

export interface AdminCohortSummary {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  status: CohortStatus;
  member_count: number;
  created_at: string;
  latest_action: CohortAdminActionType | null;
  latest_action_reason: CohortAdminReasonCode | null;
  latest_action_at: string | null;
}

export interface CohortWeeklyReview {
  cohort_id: string;
  title: string;
  week_number: number;
  week_starts_on: string;
  total_member_count: number;
  weekly_pulse_count: number;
  prompt: string;
}

export type HelpfulPractice =
  | 'sleep_routine'
  | 'movement'
  | 'digital_boundaries'
  | 'support'
  | 'coping_tools'
  | 'purposeful_activity';

export const HELPFUL_PRACTICES = [
  'sleep_routine',
  'movement',
  'digital_boundaries',
  'support',
  'coping_tools',
  'purposeful_activity'
] as const;

export const HELPFUL_PRACTICE_LABELS: Record<HelpfulPractice, string> = {
  sleep_routine: 'Consistent sleep & wake routine',
  movement: 'Daily physical movement & outdoor time',
  digital_boundaries: 'Phone charging outside bedroom & device boundaries',
  support: 'Trusted accountability & talking with friends/peers',
  coping_tools: '3-minute urge surfing, breathing, & if-then plans',
  purposeful_activity: 'Engaging hobbies, work projects, & meaningful goals'
};

export type CompletionNextStep = 'pause' | 'maintenance' | 'new_challenge';

export const COMPLETION_NEXT_STEPS = ['pause', 'maintenance', 'new_challenge'] as const;

export const COMPLETION_NEXT_STEP_LABELS: Record<CompletionNextStep, string> = {
  pause: 'Take a private pause and consolidate routines',
  maintenance: 'Continue in low-pressure private maintenance mode',
  new_challenge: 'Start a new 30-day challenge starting tomorrow'
};

export type MaintenanceCadence = 'weekly' | 'monthly';

export const MAINTENANCE_CADENCES = ['weekly', 'monthly'] as const;

export const MAINTENANCE_CADENCE_LABELS: Record<MaintenanceCadence, string> = {
  weekly: 'Weekly voluntary check-in',
  monthly: 'Monthly voluntary check-in'
};

export type MaintenanceState = 'grounded' | 'challenged' | 'resetting';

export const MAINTENANCE_STATES = ['grounded', 'challenged', 'resetting'] as const;

export const MAINTENANCE_STATE_LABELS: Record<MaintenanceState, string> = {
  grounded: 'Grounded & steady — habits holding well',
  challenged: 'Experiencing urges / elevated tension — applying coping tools',
  resetting: 'Refocusing after friction — recommitting with compassion'
};

export interface CompletionReflectionRow {
  id: string;
  user_id: string;
  attempt_id: string;
  helpful_practices: HelpfulPractice[];
  private_note: string | null;
  next_step: CompletionNextStep;
  maintenance_cadence: MaintenanceCadence | null;
  created_at: string;
  updated_at: string;
}

export interface MaintenancePreferenceRow {
  id: string;
  user_id: string;
  enabled: boolean;
  cadence: MaintenanceCadence;
  source_attempt_id: string;
  created_at: string;
  updated_at: string;
}

export interface MaintenanceCheckInRow {
  id: string;
  user_id: string;
  local_date: string;
  state: MaintenanceState;
  private_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompletionState {
  completed_attempt: {
    id: string;
    start_local_date: string;
    completed_days: number;
    ended_at: string | null;
    timezone: string;
  };
  reflection: CompletionReflectionRow | null;
  maintenance_preference: MaintenancePreferenceRow | null;
  latest_maintenance_checkin: MaintenanceCheckInRow | null;
  today_maintenance_checkin: MaintenanceCheckInRow | null;
  recent_maintenance_checkins: MaintenanceCheckInRow[];
}

export type PeerGuideApplicationStatus =
  'pending' | 'approved' | 'paused' | 'revoked' | 'withdrawn';

export const PEER_GUIDE_APPLICATION_STATUSES = [
  'pending',
  'approved',
  'paused',
  'revoked',
  'withdrawn'
] as const;

export type PeerGuideReviewReason =
  'eligible' | 'training_pending' | 'safety' | 'conduct' | 'resigned';

export const PEER_GUIDE_REVIEW_REASONS = [
  'eligible',
  'training_pending',
  'safety',
  'conduct',
  'resigned'
] as const;

export const PEER_GUIDE_REVIEW_REASON_LABELS: Record<PeerGuideReviewReason, string> = {
  eligible: 'Eligible completed alumni',
  training_pending: 'Guideline orientation pending',
  safety: 'Safety or boundary concern',
  conduct: 'Conduct or community guideline issue',
  resigned: 'Resigned voluntarily by member'
};

export type PeerGuideAdminAction = 'approve' | 'pause' | 'revoke';

export interface PeerGuideApplicationRow {
  id: string;
  user_id: string;
  statement: string;
  status: PeerGuideApplicationStatus;
  review_reason: PeerGuideReviewReason | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PeerGuideRow {
  id: string;
  user_id: string;
  public_statement: string | null;
  active: boolean;
  activated_at: string;
  deactivated_at: string | null;
  application_id: string;
  created_at: string;
  updated_at: string;
}

export interface PeerGuideActionRow {
  id: string;
  application_id: string;
  actor_id: string;
  action: 'applied' | 'approved' | 'paused' | 'revoked' | 'withdrawn';
  reason_code: PeerGuideReviewReason | null;
  created_at: string;
}

export interface PeerGuideSummary {
  user_id: string;
  handle: string;
  display_name: string | null;
  public_statement: string | null;
  is_peer_guide: boolean;
}

export interface MyPeerGuideStatusResponse {
  is_eligible: boolean;
  application: {
    id: string;
    status: PeerGuideApplicationStatus;
    statement: string;
    review_reason: PeerGuideReviewReason | null;
    reviewed_at: string | null;
    created_at: string;
    updated_at: string;
  } | null;
  guide: {
    id: string;
    active: boolean;
    public_statement: string | null;
    activated_at: string;
    deactivated_at: string | null;
  } | null;
}

export interface AdminPeerGuideApplicationSummary {
  id: string;
  user_id: string;
  handle: string;
  display_name: string | null;
  statement: string;
  status: PeerGuideApplicationStatus;
  review_reason: PeerGuideReviewReason | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}
