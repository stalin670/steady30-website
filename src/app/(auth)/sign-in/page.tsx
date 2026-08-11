import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SiteShell } from '@/components/site-chrome';
import { Banner, Card, CardTitle, FormScreen, Helper, ScreenHeader } from '@/components/ui';
import { createClient, supabaseEnv } from '@/lib/supabase/server';
import { SignInForm } from './sign-in-form';

export const metadata: Metadata = {
  title: 'Sign in or join',
  description: 'Passwordless sign-in for Steady30.',
  robots: { index: false, follow: false }
};

/**
 * Which providers this project actually has switched on.
 *
 * /auth/v1/settings is a public endpoint. Asking it means we never render a
 * "Continue with Google" button that can only answer "provider is not enabled" —
 * the sign-in page shows what genuinely works right now.
 */
const enabledProviders = async () => {
  const env = supabaseEnv();
  if (!env) return { google: false };

  try {
    const response = await fetch(`${env.url}/auth/v1/settings`, {
      headers: { apikey: env.key },
      next: { revalidate: 300 }
    });
    if (!response.ok) return { google: false };
    const settings = (await response.json()) as { external?: Record<string, boolean> };
    return { google: settings.external?.google === true };
  } catch {
    return { google: false };
  }
};

const SignIn = async ({ searchParams }: { searchParams: Promise<{ error?: string }> }) => {
  const { error } = await searchParams;
  const supabase = await createClient();
  const providers = await enabledProviders();

  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (user) redirect('/today');
  }

  return (
    <SiteShell>
      <FormScreen>
        <ScreenHeader title="Sign in or join" subtitle="Passwordless email authentication" />

        {error ? <Banner variant="danger">{error}</Banner> : null}

        {supabase ? (
          <SignInForm googleEnabled={providers.google} />
        ) : (
          <Card>
            <CardTitle>Sign-in is not configured on this environment</CardTitle>
            <Helper>
              Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
              <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to enable it.
            </Helper>
          </Card>
        )}

        <Card tone="tint">
          <CardTitle>Adults only, 18+</CardTitle>
          <Helper>
            By continuing you confirm that you are at least 18 years old and voluntarily choose to
            use Steady30. You will be asked to accept the{' '}
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
            </Link>{' '}
            before your account is created.
          </Helper>
        </Card>
      </FormScreen>
    </SiteShell>
  );
};

export default SignIn;
