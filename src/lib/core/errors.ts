/**
 * Application Error Codes and User-Friendly Formatter
 */

export const ERROR_MESSAGES: Record<string, string> = {
  AUTH_REQUIRED: 'Please sign in to perform this action.',
  'provider is not enabled':
    'That sign-in method is not available yet. Use your email address instead.',
  DUPLICATE_ACCOUNT_EMAIL:
    'You already have a Steady30 account with this email address. Sign in with the method you used the first time to keep your streak and history.',
  UNAUTHORIZED: 'This action is unavailable.',
  PROFILE_NOT_FOUND: 'Please complete onboarding first.',
  USER_SUSPENDED: 'Your account has been suspended for guideline violations.',
  ATTEMPT_NOT_ACTIVE: 'You do not have an active challenge. Start a new attempt to check in.',
  CHECKIN_WINDOW_NOT_OPEN: 'Today reflection window opens at 00:00 local time.',
  CHECKIN_TOO_LATE:
    'The 01:00 AM deadline has passed. A missed check-in resets your verified streak.',
  INVALID_LOCAL_DATE: 'Check-in date is outside your 30-day challenge window.',
  INVALID_MOOD: 'Please select a valid mood rating (1-5).',
  INVALID_URGE: 'Please select a valid urge rating (0-10).',
  INVALID_REFLECTION: 'Private reflection must be at least 20 characters.',
  INVALID_TIMEZONE: 'Choose a valid IANA timezone, such as Asia/Kolkata.',
  INVALID_TRIGGER: 'Select only the provided trigger options.',
  INVALID_COPING_ACTION: 'Select at least one provided coping action.',
  INVALID_PUBLIC_EXCERPT: 'A public excerpt must be between 20 and 600 characters.',
  RATE_LIMITED: 'You are posting too quickly. Please wait and try again.',
  POST_NOT_AVAILABLE: 'This post is unavailable or no longer open for comments.',
  TARGET_NOT_AVAILABLE: 'This content is unavailable.',
  UGC_URLS_PROHIBITED: 'External links and website URLs are not permitted.',
  UGC_CONTACT_PROHIBITED: 'Contact details, email addresses, and phone numbers are not permitted.',
  CONTENT_PENDING_REVIEW: 'This contribution is currently pending moderation review.',
  DUPLICATE_REQUEST: 'This action has already been processed.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  CONTACT_NOT_FOUND: 'No account was found for that handle, or this contact is unavailable.',
  CONNECTION_LIMIT_REACHED:
    'You or the recipient have reached the maximum number of trusted connections.',
  CONNECTION_BLOCKED: 'This action is unavailable.',
  CONNECTION_NOT_ACCEPTED: 'A support request can only be sent to an accepted trusted contact.',
  SUPPORT_REQUEST_RATE_LIMITED:
    'You have reached the limit of 3 support requests in 24 hours for this contact.',
  CONNECTION_NOT_PENDING: 'This invitation is no longer pending.',
  CONNECTION_ALREADY_EXISTS: 'A connection or invitation already exists with this member.',
  CONNECTION_NOT_FOUND: 'This trusted connection is unavailable.',
  REQUEST_NOT_OPEN: 'This support request has already been acknowledged or closed.',
  REQUEST_NOT_FOUND: 'This support request is unavailable.',
  INVALID_ACTION: 'Choose a valid response to this invitation.',
  INVALID_COMMUNITY_STAGE: 'Please select a valid stage category or leave it untagged.',
  COHORT_NOT_FOUND: 'The requested cohort could not be found.',
  COHORT_NOT_OPEN: 'This cohort is no longer open for enrollment.',
  COHORT_FULL: 'This cohort has reached its maximum capacity of 8 members.',
  ALREADY_IN_COHORT: 'You are already enrolled in this cohort.',
  ACTIVE_COHORT_EXISTS:
    'You are already enrolled in an active cohort. Members may only join one cohort at a time.',
  COHORT_MEMBERSHIP_REQUIRED: 'You must be an active member of this cohort to perform this action.',
  COHORT_ALREADY_STARTED: 'You cannot leave a cohort after it has already started.',
  COHORT_NOT_ACTIVE: 'This cohort is not currently active for weekly pulses.',
  INVALID_COHORT_INTENTION: 'Please select a valid weekly intention.',
  ADMIN_REQUIRED: 'Administrator privileges are required to perform this action.',
  MODERATOR_REQUIRED: 'Staff privileges are required to access this console.',
  INVALID_COHORT_SCHEDULE: 'Cohort start date must be scheduled at least 1 hour in the future.',
  INVALID_COHORT_TITLE: 'Cohort title must be between 3 and 80 characters.',
  INVALID_COHORT_CAPACITY: 'Cohort capacity must be between 2 and 8 members.',
  INVALID_COHORT_STATUS: 'Please select a valid cohort lifecycle status.',
  INVALID_COHORT_TRANSITION:
    'The requested cohort status transition is not permitted at this time.',
  INVALID_COHORT_ACTION_REASON: 'Please select a valid structured reason code for this action.',
  COMPLETION_REQUIRED:
    'You need a completed 30-day challenge to access completion reflection and maintenance mode.',
  INVALID_COMPLETION_REFLECTION:
    'Please select valid reflection practices and keep any private note between 20 and 500 characters.',
  INVALID_MAINTENANCE_CADENCE: 'Please select a valid maintenance cadence (weekly or monthly).',
  MAINTENANCE_NOT_ENABLED: 'Maintenance mode is currently paused. Enable it to record check-ins.',
  INVALID_MAINTENANCE_CHECKIN:
    'Please select a valid check-in state (grounded, challenged, or resetting) and keep any private note between 20 and 500 characters.',
  INVALID_GUIDE_STATEMENT:
    'Application statement must be 20 to 500 characters (or 20 to 160 characters for public statement).',
  GUIDE_APPLICATION_PENDING:
    'You already have an active peer guide application or approved status.',
  GUIDE_APPLICATION_NOT_FOUND: 'Peer guide application could not be found.',
  GUIDE_APPLICATION_NOT_WITHDRAWABLE:
    'Only a pending application or active peer guide status can be withdrawn.',
  GUIDE_NOT_ACTIVE: 'You must be an approved, active peer guide to perform this action.',
  INVALID_GUIDE_ACTION: 'Please choose a valid review action (approve, pause, or revoke).',
  INVALID_GUIDE_REASON: 'Please select a valid structured review reason code.'
};

export const formatErrorMessage = (error: any): string => {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const rawMessage = error.message || String(error);

  for (const [code, userMsg] of Object.entries(ERROR_MESSAGES)) {
    if (rawMessage.includes(code)) {
      return userMsg;
    }
  }

  if (rawMessage.includes('unique constraint') || rawMessage.includes('uq_')) {
    return 'A record for this item already exists.';
  }

  if (rawMessage.includes('network') || rawMessage.includes('fetch')) {
    return 'Network connection issue. Please check your internet connection.';
  }

  return rawMessage;
};
