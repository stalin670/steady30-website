'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Banner,
  Button,
  Card,
  CardTitle,
  Helper,
  Input,
  RadioGroup,
  TextArea
} from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { COMMON_TIMEZONES, detectTimezone, getLocalDateString } from '@/lib/core/date';
import { formatErrorMessage } from '@/lib/core/errors';
import { SettingsProfileSchema } from '@/lib/core/validation';
import { validateUGCText } from '@/lib/core/moderation';

type Theme = 'light' | 'dark' | 'system';

export const SettingsForm = ({
  initial
}: {
  initial: {
    displayName: string;
    bio: string;
    timezone: string;
    leaderboardOptIn: boolean;
    profileVisibility: 'members' | 'public' | 'private';
  };
}) => {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initial.displayName);
  const [bio, setBio] = useState(initial.bio);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSaved(false);

    const parsed = SettingsProfileSchema.safeParse({
      displayName: displayName.trim() || null,
      bio: bio.trim() || null,
      leaderboardOptIn: initial.leaderboardOptIn,
      profileVisibility: initial.profileVisibility
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Please check your details.');
      return;
    }

    // A bio is public. Same gate the community feed uses.
    if (bio.trim()) {
      const moderation = validateUGCText(bio.trim());
      if (!moderation.isValid) {
        setError(moderation.error ?? 'That bio cannot be published.');
        return;
      }
    }

    setSaving(true);

    try {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('AUTH_REQUIRED');

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim() || null,
          bio: bio.trim() || null,
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
    <form onSubmit={saveProfile} className="flex flex-col gap-6">
      {error ? <Banner variant="danger">{error}</Banner> : null}
      {saved ? <Banner variant="success">Profile updated.</Banner> : null}

      <Card>
        <CardTitle>Profile</CardTitle>
        <Helper>
          Your handle is permanent and cannot be changed here — it is what other members know you
          by, and rewriting it would break every thread you have taken part in.
        </Helper>
        <Input
          id="display-name"
          label="Display name"
          placeholder="Voyager"
          maxLength={40}
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          hint={<span className="tnum">{displayName.length}/40 · optional</span>}
        />
        <TextArea
          id="bio"
          label="Bio"
          placeholder="Short supportive bio…"
          maxLength={280}
          rows={4}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          hint={
            <span className="tnum">
              {bio.length}/280 · public · no links or contact details
            </span>
          }
        />
        <Button type="submit" loading={saving} full>
          Save changes
        </Button>
      </Card>
    </form>
  );
};

/**
 * Timezone lives on its own, and changes only when someone chooses it.
 *
 * Deadlines and the on-time streak are computed against preferred_timezone. Auto-
 * detecting on every visit would move a member's deadline the first time they open
 * the site on a laptop in another timezone — potentially closing today's window
 * early and breaking a streak they had earned. See docs/web-app-spec.md §7b(d).
 */
export const TimezoneCard = ({ current }: { current: string }) => {
  const router = useRouter();
  const [selected, setSelected] = useState(current);
  const [browserZone, setBrowserZone] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const detected = detectTimezone();
    if (detected && detected !== current) setBrowserZone(detected);
  }, [current]);

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
        .update({ preferred_timezone: selected, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (updateError) throw updateError;

      setBrowserZone(null);
      setSaved(true);
      router.refresh();
    } catch (err: unknown) {
      setError(formatErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const options = Array.from(new Set([current, selected, ...COMMON_TIMEZONES])).filter(Boolean);

  return (
    <Card>
      <CardTitle>Timezone</CardTitle>
      <Helper>
        Your day starts and your reflection deadline falls in this timezone. Changing it moves
        today’s deadline, so it only changes when you say so.
      </Helper>

      {error ? <Banner variant="danger">{error}</Banner> : null}
      {saved ? <Banner variant="success">Timezone updated.</Banner> : null}

      {browserZone ? (
        <Banner variant="info">
          This browser reports <strong>{browserZone}</strong>, which is different from your account
          timezone. Nothing has been changed — switch below only if you have genuinely moved.
        </Banner>
      ) : null}

      <div className="flex flex-col gap-2">
        <label htmlFor="timezone" className="text-[14px] font-semibold">
          Account timezone
        </label>
        <select
          id="timezone"
          value={selected}
          onChange={(event) => setSelected(event.target.value)}
          className="w-full rounded-[10px] border border-line bg-input px-4 py-3 text-[16px] text-ink"
        >
          {options.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
        <p className="text-[13px] text-subtle">
          Local date there is now{' '}
          <span className="tnum">{getLocalDateString(new Date(), selected)}</span>.
        </p>
      </div>

      <Button type="button" loading={saving} disabled={selected === current} onClick={save}>
        {selected === current ? 'Timezone unchanged' : `Change timezone to ${selected}`}
      </Button>
    </Card>
  );
};

export const ThemeCard = () => {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('steady30-theme');
      setTheme(stored === 'dark' || stored === 'light' ? stored : 'system');
    } catch {
      setTheme('system');
    }
  }, []);

  const apply = (next: Theme) => {
    setTheme(next);
    try {
      if (next === 'system') {
        localStorage.removeItem('steady30-theme');
        document.documentElement.dataset.theme = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches
          ? 'dark'
          : 'light';
      } else {
        localStorage.setItem('steady30-theme', next);
        document.documentElement.dataset.theme = next;
      }
    } catch {
      // Storage blocked; the theme still applies for this session.
    }
  };

  return (
    <Card>
      <CardTitle>Theme</CardTitle>
      <Helper>Stored in this browser only — it is a preference, not account data.</Helper>
      <RadioGroup<Theme>
        name="Theme"
        value={theme}
        onSelect={apply}
        options={[
          { value: 'system', label: 'Match my system' },
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' }
        ]}
      />
    </Card>
  );
};
