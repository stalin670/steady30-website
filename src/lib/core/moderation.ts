/**
 * Client-Side Text Moderation and UGC Validation
 * Blocks URLs, email addresses, phone numbers, and explicit contact solicitations.
 */

export const validateUGCText = (text: string): { isValid: boolean; error?: string } => {
  if (!text) return { isValid: true };

  // 1. Email check
  if (/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text)) {
    return {
      isValid: false,
      error:
        'Personal contact information and email addresses are not permitted in community posts.'
    };
  }

  // 2. Phone number check
  if (/(\+?[0-9]{1,3}[-.\s]?)?(\(?[0-9]{3}\)?[-.\s]?)?[0-9]{3}[-.\s]?[0-9]{4}/.test(text)) {
    return {
      isValid: false,
      error: 'Phone numbers and contact solicitations are not permitted.'
    };
  }

  // 3. URL check
  if (
    /https?:\/\/|www\.[a-z0-9]|(\.com|\.org|\.net|\.io|\.co|\.app|\.me|\.info|\.xyz)($|[/\s.,;!?])/i.test(
      text
    )
  ) {
    return {
      isValid: false,
      error: 'External links and website URLs are not permitted.'
    };
  }

  return { isValid: true };
};
