'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Banner, Button, Card, Helper, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { formatErrorMessage } from '@/lib/core/errors';

export const SignInForm = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [sendingGoogle, setSendingGoogle] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();

    if (!normalized.includes('@')) {
      setError('Enter a valid email address, for example you@example.com.');
      return;
    }

    setSendingOtp(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: normalized,
        options: {
          shouldCreateUser: true,
          // If the project's email template sends a link rather than a code, the
          // link has to come back to our callback rather than the app scheme.
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (otpError) throw otpError;

      // The address is needed to verify the code. It is a query param on a route
      // that stores nothing — no reflection, check-in, or behavioural data ever
      // travels this way (AGENTS.md).
      router.push(`/verify?email=${encodeURIComponent(normalized)}`);
    } catch (err: unknown) {
      setError(formatErrorMessage(err));
      setSendingOtp(false);
    }
  };

  const handleGoogle = async () => {
    setSendingGoogle(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      });
      if (oauthError) throw oauthError;
      // Supabase redirects the browser from here.
    } catch (err: unknown) {
      setError(formatErrorMessage(err));
      setSendingGoogle(false);
    }
  };

  return (
    <>
      {error ? <Banner variant="danger">{error}</Banner> : null}

      <Card>
        <Helper>
          Enter your email to receive a secure one-time passcode. There is no password to remember
          or lose.
        </Helper>

        <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
          <Input
            id="email"
            label="Email address"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Button type="submit" loading={sendingOtp} full>
            Send verification code
          </Button>
        </form>

        <div className="flex items-center gap-4 text-[13px] text-subtle">
          <span className="h-px flex-1 bg-[var(--border)]" />
          or
          <span className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <Button type="button" variant="outline" loading={sendingGoogle} onClick={handleGoogle} full>
          Continue with Google
        </Button>
      </Card>
    </>
  );
};
