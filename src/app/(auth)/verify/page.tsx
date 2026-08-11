import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SiteShell } from '@/components/site-chrome';
import { FormScreen, ScreenHeader } from '@/components/ui';
import { VerifyForm } from './verify-form';

export const metadata: Metadata = {
  title: 'Verify your email',
  robots: { index: false, follow: false }
};

const Verify = async ({ searchParams }: { searchParams: Promise<{ email?: string }> }) => {
  const { email } = await searchParams;
  if (!email) redirect('/sign-in');

  return (
    <SiteShell>
      <FormScreen>
        <ScreenHeader title="Check your email" subtitle="Enter the code we just sent you." />
        <VerifyForm email={email.trim().toLowerCase()} />
      </FormScreen>
    </SiteShell>
  );
};

export default Verify;
