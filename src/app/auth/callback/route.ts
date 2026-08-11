import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

/**
 * Landing point for every redirect-based sign-in.
 *
 * Handles both shapes, because this project produces both:
 *   ?code=…                    OAuth / PKCE (Google)
 *   ?token_hash=…&type=…       email link
 *
 * The email-link branch matters: per docs/operations/google-sign-in-setup.md the
 * Supabase email templates for this project send `{{ .ConfirmationURL }}`, not
 * `{{ .Token }}`. The native app cannot use a link, so it is blocked until the
 * templates change — but a browser can, so the web works either way.
 */
export const GET = async (request: NextRequest) => {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const errorDescription = searchParams.get('error_description');

  const failure = (reason: string) =>
    NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent(reason)}`);

  if (errorDescription) return failure(errorDescription);

  const supabase = await createClient();
  if (!supabase) return failure('Sign-in is not configured on this environment.');

  let userId: string | null = null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.session?.user) {
      return failure('That sign-in link has expired. Request a new one.');
    }
    userId = data.session.user.id;
  } else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error || !data.session?.user) {
      return failure('That sign-in link has expired. Request a new one.');
    }
    userId = data.session.user.id;
  } else {
    return failure('Sign-in did not complete. Please try again.');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('handle')
    .eq('id', userId)
    .maybeSingle();

  return NextResponse.redirect(`${origin}${profile?.handle ? '/today' : '/onboarding'}`);
};
