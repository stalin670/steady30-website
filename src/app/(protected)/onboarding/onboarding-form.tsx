'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Banner,
  Button,
  Card,
  CardTitle,
  Checkbox,
  Helper,
  Input
} from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { formatErrorMessage } from '@/lib/core/errors';
import { OnboardingSchema } from '@/lib/core/validation';
import { COMMON_TIMEZONES, detectTimezone, getLocalDateString } from '@/lib/core/date';

const CONSENTS = [
  {
    key: 'adultAttested',
    label: 'I am 18 years of age or older',
    sublabel: 'Steady30 is strictly intended for consenting adult users.'
  },
  {
    key: 'termsAccepted',
    label: 'I accept the Terms of Service',
    sublabel:
      'I acknowledge Steady30 is an educational accountability tool, not medical therapy.'
  },
  {
    key: 'guidelinesAccepted',
    label: 'I accept the Community Guidelines',
    sublabel:
      'I agree to keep content text-only with no links, contact details, or explicit descriptions.'
  },
  {
    key: 'privacyAccepted',
    label: 'I consent to the Privacy Policy',
    sublabel:
      'I acknowledge special-category data handling under GDPR Article 9 and the DPDPA 2023.'
  }
] as const;

type ConsentKey = (typeof CONSENTS)[number]['key'];

export const OnboardingForm = ({ detected }: { detected: string }) => {
  const router = useRouter();
  const [handle, setHandle] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [timezone, setTimezone] = useState(detected || detectTimezone());
  const [consents, setConsents] = useState<Record<ConsentKey, boolean>>({
    adultAttested: false,
    termsAccepted: false,
    guidelinesAccepted: false,
    privacyAccepted: false
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicate, setDuplicate] = useState<{ providers: string[] } | null>(null);

  const timezoneOptions = Array.from(new Set([timezone, ...COMMON_TIMEZONES])).filter(Boolean);

  const signOutAndRetry = async () => {
    await createClient().auth.signOut();
    router.replace('/sign-in');
    router.refresh();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const normalizedHandle = handle.trim().toLowerCase();
    const result = OnboardingSchema.safeParse({
      handle: normalizedHandle,
      displayName: displayName.trim() || null,
      timezone,
      ...consents
    });

    if (!result.success) {
      setError(result.error.errors[0]?.message ?? 'Please complete every required field.');
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('AUTH_REQUIRED');

      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('handle')
        .eq('id', user.id)
        .maybeSingle();

      if (existingProfile?.handle) {
        router.replace('/onboarding/challenge');
        return;
      }

      // Before blaming the handle, check whether this is really the same person
      // arriving on a second auth identity. Telling someone their own handle is
      // "taken" is the worst possible reading of that situation.
      const { data: conflict } = await supabase.rpc('account_email_conflict');
      if (conflict?.conflict) {
        setDuplicate({ providers: conflict.providers ?? [] });
        setSaving(false);
        return;
      }

      const { data: taken } = await supabase
        .from('profiles')
        .select('id')
        .eq('handle', normalizedHandle)
        .neq('id', user.id)
        .maybeSingle();

      if (taken) {
        setError('That handle is already taken. Please choose another.');
        setSaving(false);
        return;
      }

      const now = new Date().toISOString();
      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        handle: normalizedHandle,
        display_name: displayName.trim() || null,
        // Written here and only here. Re-detecting the timezone on later sign-ins
        // would move a member's deadline when they open the site from another
        // machine, and could close a check-in window they had earned.
        preferred_timezone: timezone,
        terms_version: '1.0',
        guidelines_version: '1.0',
        privacy_version: '1.0',
        accepted_at: now,
        adult_attested_at: now,
        updated_at: now
      });
      if (insertError) throw insertError;

      router.replace('/onboarding/challenge');
      router.refresh();
    } catch (err: unknown) {
      // The DB trigger is the backstop if the pre-check above raced or was skipped.
      if (err instanceof Error && err.message.includes('DUPLICATE_ACCOUNT_EMAIL')) {
        setDuplicate({ providers: [] });
        setSaving(false);
        return;
      }
      setError(formatErrorMessage(err));
      setSaving(false);
    }
  };

  // The recovery screen. Reached when this email already has another account —
  // creating a second profile here would fork their streak permanently.
  if (duplicate) {
    const providerLabel = duplicate.providers.includes('google')
      ? 'Continue with Google'
      : 'the email code';

    return (
      <Card tone="outline">
        <CardTitle>You already have a Steady30 account</CardTitle>
        <Helper>
          This email address is already attached to an account created with a different sign-in
          method. Continuing here would start a second, separate streak and history rather than
          opening the one you already have.
        </Helper>
        <Helper>
          Sign out and sign back in using <strong className="text-ink">{providerLabel}</strong> to
          get back to your existing account. Nothing has been lost — no profile was created.
        </Helper>
        <Button type="button" onClick={signOutAndRetry} full>
          Sign out and try the other method
        </Button>
        <Helper>
          If neither method works, email{' '}
          <a
            href="mailto:support@steady30.online?subject=Sign-in%20method%20mismatch"
            className="underline underline-offset-[3px]"
          >
            support@steady30.online
          </a>{' '}
          and we can link them for you. Do not include reflections or other private details.
        </Helper>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error ? <Banner variant="danger">{error}</Banner> : null}

      <Card>
        <CardTitle>Choose your pseudonymous handle</CardTitle>
        <Helper>
          Your handle is public. To protect your privacy, never use your real full name, email
          address, or anything else that identifies you.
        </Helper>

        <Input
          id="handle"
          label="Handle"
          placeholder="steady_voyager"
          value={handle}
          onChange={(event) =>
            setHandle(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
          }
          autoCapitalize="none"
          autoCorrect="off"
          hint="Lowercase letters, numbers, and underscores. 3–24 characters."
          required
        />

        <Input
          id="display-name"
          label="Display name (optional)"
          placeholder="Voyager"
          maxLength={40}
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
        />

        <div className="flex flex-col gap-2">
          <label htmlFor="timezone" className="text-[14px] font-semibold">
            Your timezone
          </label>
          <select
            id="timezone"
            value={timezone}
            onChange={(event) => setTimezone(event.target.value)}
            className="w-full rounded-[10px] border border-line bg-input px-4 py-3 text-[16px] text-ink"
          >
            {timezoneOptions.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
          <p className="text-[13px] text-subtle">
            Your day starts and your deadline falls in this timezone. Local date today is{' '}
            <span className="tnum">{getLocalDateString(new Date(), timezone)}</span>.
          </p>
        </div>
      </Card>

      <Card>
        <CardTitle>Attestations and consent</CardTitle>
        <div className="flex flex-col">
          {CONSENTS.map((consent) => (
            <Checkbox
              key={consent.key}
              id={consent.key}
              checked={consents[consent.key]}
              onToggle={() =>
                setConsents((current) => ({ ...current, [consent.key]: !current[consent.key] }))
              }
              label={consent.label}
              sublabel={consent.sublabel}
            />
          ))}
        </div>
        <Helper>
          Read the{' '}
          <Link href="/terms" className="underline underline-offset-[3px]">
            Terms
          </Link>
          ,{' '}
          <Link href="/community-guidelines" className="underline underline-offset-[3px]">
            Community Guidelines
          </Link>
          , and{' '}
          <Link href="/privacy" className="underline underline-offset-[3px]">
            Privacy Policy
          </Link>
          .
        </Helper>
        <Button type="submit" loading={saving} full>
          Continue to challenge setup
        </Button>
      </Card>
    </form>
  );
};
