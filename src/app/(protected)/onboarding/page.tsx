import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SiteShell } from '@/components/site-chrome';
import { FormScreen, ScreenHeader } from '@/components/ui';
import { requireMember } from '@/lib/session';
import { OnboardingForm } from './onboarding-form';

export const metadata: Metadata = {
  title: 'Welcome',
  robots: { index: false, follow: false }
};

const Onboarding = async () => {
  const { profile } = await requireMember({ allowMissingProfile: true });
  if (profile?.handle) redirect('/onboarding/challenge');

  return (
    <SiteShell>
      <FormScreen>
        <ScreenHeader
          step="Step 1 of 2"
          title="Welcome to Steady30"
          subtitle="Set up your profile and consent."
        />
        {/* The browser timezone is a suggested default only; the member confirms it. */}
        <OnboardingForm detected="" />
      </FormScreen>
    </SiteShell>
  );
};

export default Onboarding;
