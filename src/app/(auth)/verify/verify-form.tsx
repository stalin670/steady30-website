'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Banner, Button, Card, Helper, Input } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { formatErrorMessage } from '@/lib/core/errors';

export const VerifyForm = ({ email }: { email: string }) => {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = code.trim();

    if (token.length < 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      });
      if (verifyError) throw verifyError;
      if (!data.user) throw new Error('AUTH_REQUIRED');

      const { data: profile } = await supabase
        .from('profiles')
        .select('handle')
        .eq('id', data.user.id)
        .maybeSingle();

      // Same branch as ../Steady30/src/screens/verify-screen.tsx.
      router.replace(profile?.handle ? '/today' : '/onboarding');
      router.refresh();
    } catch (err: unknown) {
      setError(formatErrorMessage(err));
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    setResent(false);

    try {
      const supabase = createClient();
      const { error: resendError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true }
      });
      if (resendError) throw resendError;
      setResent(true);
    } catch (err: unknown) {
      setError(formatErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      {error ? <Banner variant="danger">{error}</Banner> : null}
      {resent ? <Banner variant="success">A new code is on its way.</Banner> : null}

      <Card>
        <Helper>
          We sent an email to <strong className="text-ink">{email}</strong>. Enter the 6-digit code
          below, or just click the link in the email — either works, and both expire shortly.
        </Helper>

        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <Input
            id="code"
            label="6-digit verification code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            maxLength={8}
            placeholder="123456"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
            autoFocus
            required
          />
          <Button type="submit" loading={verifying} full>
            Verify and continue
          </Button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-[14px] text-muted">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="underline underline-offset-[3px] hover:text-ink disabled:opacity-55"
          >
            {resending ? 'Sending…' : 'Send a new code'}
          </button>
          <Link href="/sign-in" className="underline underline-offset-[3px] hover:text-ink">
            Use a different email
          </Link>
        </div>
      </Card>
    </>
  );
};
