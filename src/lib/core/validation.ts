import { z } from 'zod';

// Reserved handles that cannot be registered
export const RESERVED_HANDLES = [
  'admin',
  'moderator',
  'mod',
  'support',
  'help',
  'steady30',
  'official',
  'system',
  'security',
  'api',
  'root',
  'bot',
  'staff',
  'team'
];

export const HandleSchema = z
  .string()
  .min(3, 'Handle must be at least 3 characters')
  .max(24, 'Handle cannot exceed 24 characters')
  .regex(/^[a-z0-9_]+$/, 'Handle may only contain lowercase letters, numbers, and underscores')
  .refine((h) => !RESERVED_HANDLES.includes(h.toLowerCase()), {
    message: 'This handle is reserved'
  });

export const OnboardingSchema = z.object({
  handle: HandleSchema,
  displayName: z.string().max(40, 'Display name cannot exceed 40 characters').optional().nullable(),
  bio: z.string().max(280, 'Bio cannot exceed 280 characters').optional().nullable(),
  timezone: z.string().min(1, 'Please select your timezone'),
  adultAttested: z.literal(true, {
    errorMap: () => ({ message: 'You must be at least 18 years old to use Steady30' })
  }),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Terms of Service' })
  }),
  guidelinesAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Community Guidelines' })
  }),
  privacyAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Privacy Policy' })
  })
});

export const ALLOWED_TRIGGER_CATEGORIES = [
  'Boredom / Aimless browsing',
  'Stress / Anxiety',
  'Loneliness / Isolation',
  'Fatigue / Late night alone',
  'Overstimulation / Social media cue',
  'Interpersonal conflict',
  'Habitual routine / Idle time',
  'No trigger today'
] as const;

export const ALLOWED_COPING_ACTIONS = [
  '3-Min Urge Surfing',
  'Paced Box Breathing',
  'If-Then Coping Plan',
  'Physical movement / Walk',
  'Cold water / Grounding',
  'Changed physical room / environment',
  'Put phone outside bedroom',
  'Talked to peer / friend',
  'Read educational lesson',
  'No urge today'
] as const;

export const HIGH_RISK_WINDOWS = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'late_night', label: 'Late night' },
  { value: 'unpredictable', label: 'Unpredictable' }
] as const;

const CopingPlanSchema = z.object({
  ifCue: z.string().trim().min(1, 'Complete every IF cue').max(280),
  thenAction: z.string().trim().min(1, 'Complete every THEN action').max(280)
});

export const ChallengeSetupSchema = z.object({
  goalScope: z.enum(['pornography', 'masturbation', 'both']),
  primaryReason: z
    .string()
    .trim()
    .min(20, 'Write at least 20 characters about why this matters')
    .max(500),
  highRiskWindows: z
    .array(z.enum(['morning', 'afternoon', 'evening', 'late_night', 'unpredictable']))
    .min(1, 'Select at least one high-risk time'),
  triggerCategories: z
    .array(z.enum(ALLOWED_TRIGGER_CATEGORIES))
    .min(1, 'Select at least one anticipated trigger')
    .refine(
      (values) => !values.includes('No trigger today'),
      'Choose anticipated triggers, not “No trigger today”'
    ),
  supportStyle: z.enum(['private', 'community', 'balanced']),
  plans: z.array(CopingPlanSchema).length(3, 'Create exactly three if-then plans')
});

export const DailyCheckInSchema = z.object({
  mood: z.number().int().min(1, 'Please select your mood (1-5)').max(5),
  urgeIntensity: z.number().int().min(0, 'Urge intensity must be 0-10').max(10),
  triggerCategories: z
    .array(z.string())
    .min(1, 'Select at least one trigger or "No trigger today"'),
  copingActions: z.array(z.string()).min(1, 'Select at least one coping action or "No urge today"'),
  privateReflection: z
    .string()
    .min(
      20,
      'Reflection must be at least 20 characters answering: What happened, what helped, and what will you try tomorrow?'
    )
    .max(4000, 'Reflection cannot exceed 4000 characters'),
  isPublicOptedIn: z.boolean().default(false),
  publicExcerpt: z
    .string()
    .max(600, 'Public excerpt cannot exceed 600 characters')
    .optional()
    .nullable()
    .refine((val) => !val || val.length >= 20, {
      message: 'Public excerpt must be at least 20 characters if provided'
    })
});

export const CommunityStageSchema = z.enum(['starting', 'building', 'sustaining', 'alumni']);

export const StandalonePostSchema = z.object({
  body: z
    .string()
    .min(20, 'Post must be at least 20 characters')
    .max(1200, 'Post cannot exceed 1200 characters'),
  communityStage: CommunityStageSchema.optional().nullable()
});

export const CommentSchema = z.object({
  body: z
    .string()
    .min(2, 'Comment must be at least 2 characters')
    .max(600, 'Comment cannot exceed 600 characters')
});

export const RelapseSchema = z.object({
  categories: z.array(z.string()).default([]),
  privateNote: z.string().max(2000, 'Note cannot exceed 2000 characters').optional().nullable(),
  confirmReset: z.literal(true, {
    errorMap: () => ({ message: 'Please confirm honest reset of current attempt' })
  })
});

export const ReportSchema = z.object({
  reason: z.enum([
    'explicit_sexual_content',
    'harassment',
    'hate',
    'self_harm',
    'spam',
    'contact_solicitation',
    'misinformation',
    'other'
  ]),
  detail: z.string().max(1000, 'Details cannot exceed 1000 characters').optional().nullable()
});

export const SettingsProfileSchema = z.object({
  displayName: z.string().max(40, 'Display name cannot exceed 40 characters').optional().nullable(),
  bio: z.string().max(280, 'Bio cannot exceed 280 characters').optional().nullable(),
  leaderboardOptIn: z.boolean(),
  profileVisibility: z.enum(['members', 'public', 'private'])
});

export const TrustedContactInviteSchema = z.object({
  handle: z
    .string()
    .trim()
    .transform((h) => h.replace(/^@+/, ''))
    .pipe(HandleSchema)
});

export const CohortIntentionSchema = z.enum(['return', 'steady', 'ask_for_encouragement']);

export const CohortWeeklyPulseSchema = z.object({
  intention: CohortIntentionSchema
});

export const JoinCohortSchema = z.object({
  cohortId: z.string().uuid('Invalid cohort ID')
});

export const LeaveCohortSchema = z.object({
  cohortId: z.string().uuid('Invalid cohort ID')
});

export const CohortAdminActionEnum = z.enum(['created', 'activated', 'completed', 'cancelled']);

export const CohortAdminReasonEnum = z.enum([
  'schedule',
  'low_enrollment',
  'safety',
  'routine_completion'
]);

export const AdminCreateCohortSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Cohort title must be at least 3 characters')
    .max(80, 'Cohort title cannot exceed 80 characters'),
  startsAt: z.string().min(1, 'Please select a start date and time'),
  capacity: z
    .number()
    .int('Capacity must be an integer')
    .min(2, 'Capacity must be at least 2')
    .max(8, 'Capacity cannot exceed 8')
    .default(8)
});

export const AdminSetCohortStatusSchema = z.object({
  cohortId: z.string().uuid('Invalid cohort ID'),
  status: z.enum(['active', 'completed', 'cancelled']),
  reasonCode: CohortAdminReasonEnum
});

export const HelpfulPracticeEnum = z.enum([
  'sleep_routine',
  'movement',
  'digital_boundaries',
  'support',
  'coping_tools',
  'purposeful_activity'
]);

export const CompletionNextStepEnum = z.enum(['pause', 'maintenance', 'new_challenge']);

export const MaintenanceCadenceEnum = z.enum(['weekly', 'monthly']);

export const MaintenanceStateEnum = z.enum(['grounded', 'challenged', 'resetting']);

export const CompletionReflectionSchema = z
  .object({
    attemptId: z.string().uuid('Invalid attempt ID'),
    helpfulPractices: z.array(HelpfulPracticeEnum).default([]),
    privateNote: z
      .string()
      .trim()
      .optional()
      .nullable()
      .refine((val) => !val || (val.length >= 20 && val.length <= 500), {
        message: 'Private note must be between 20 and 500 characters if provided'
      }),
    nextStep: CompletionNextStepEnum,
    maintenanceCadence: MaintenanceCadenceEnum.optional().nullable()
  })
  .refine((data) => (data.nextStep === 'maintenance' ? Boolean(data.maintenanceCadence) : true), {
    message: 'Please choose a maintenance cadence (weekly or monthly)',
    path: ['maintenanceCadence']
  });

export const MaintenanceCheckInSchema = z.object({
  state: MaintenanceStateEnum,
  privateNote: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || (val.length >= 20 && val.length <= 500), {
      message: 'Private note must be between 20 and 500 characters if provided'
    })
});

export const SetMaintenanceEnabledSchema = z.object({
  enabled: z.boolean()
});

export const PeerGuideReviewReasonEnum = z.enum([
  'eligible',
  'training_pending',
  'safety',
  'conduct',
  'resigned'
]);

export const PeerGuideAdminActionEnum = z.enum(['approve', 'pause', 'revoke']);

export const ApplyPeerGuideSchema = z.object({
  statement: z
    .string()
    .trim()
    .min(20, 'Application statement must be at least 20 characters')
    .max(500, 'Application statement cannot exceed 500 characters')
});

export const UpdatePeerGuideStatementSchema = z.object({
  publicStatement: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || (val.length >= 20 && val.length <= 160), {
      message: 'Public statement must be between 20 and 160 characters if provided'
    })
});

export const AdminReviewPeerGuideSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  action: PeerGuideAdminActionEnum,
  reason: PeerGuideReviewReasonEnum
});
