'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Banner, Button, Card, CardTitle, Checkbox, Helper, RadioGroup } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { formatErrorMessage } from '@/lib/core/errors';

type Visibility = 'members' | 'public' | 'private';

export const PrivacyForm = ({
  initialOptIn,
  initialVisibility
}: {
  initialOptIn: boolean;
  initialVisibility: Visibility;
}) => {
  const router = useRouter();
  const [optIn, setOptIn] = useState(initialOptIn);
  const [visibility, setVisibility] = useState<Visibility>(initialVisibility);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('AUTH_REQUIRED');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          leaderboard_opt_in: optIn,
          profile_visibility: visibility,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      if (updateError) throw updateError;

      setSaved(true);
      router.refresh();
    } catch (err: unknown) {
      setError(formatErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {error ? <Banner variant="danger">{error}</Banner> : null}
      {saved ? <Banner variant="success">Privacy preferences updated.</Banner> : null}

      <Card>
        <CardTitle>Leaderboard</CardTitle>
        <Checkbox
          id="leaderboard"
          checked={optIn}
          onToggle={() => setOptIn(!optIn)}
          label="Show my handle on the leaderboard"
          sublabel="Off by default. Only your on-time check-in streak is listed — never abstinence, reflections, or anything else. You can withdraw at any time."
        />
      </Card>

      <Card>
        <CardTitle>Profile visibility</CardTitle>
        <RadioGroup<Visibility>
          name="Profile visibility"
          value={visibility}
          onSelect={setVisibility}
          options={[
            {
              value: 'members',
              label: 'Members only',
              sublabel: 'Visible to signed-in members. The default.'
            },
            { value: 'public', label: 'Public', sublabel: 'Visible to visitors' },
            {
              value: 'private',
              label: 'Private',
              sublabel: 'Hidden from listings and profile pages'
            }
          ]}
        />
        <Button type="button" loading={saving} onClick={save} full>
          Save privacy settings
        </Button>
      </Card>

      <Card tone="tint">
        <CardTitle>What is never visible, whatever you choose</CardTitle>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-muted">
          <li>Your private reflections and relapse notes</li>
          <li>Your mood ratings, urge intensities, and triggers</li>
          <li>Missed check-ins and deadline history</li>
          <li>Anything you write in Steady Now</li>
        </ul>
        <Helper>
          These settings change who can see your handle and profile — not whether anyone can see
          your practice. Nobody can.
        </Helper>
      </Card>
    </div>
  );
};
