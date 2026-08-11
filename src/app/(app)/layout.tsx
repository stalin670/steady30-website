import { AppShell } from '@/components/app-shell';
import { requireMember } from '@/lib/session';

/** Member data — never prerendered, never cached. See (protected)/layout.tsx. */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const AppLayout = async ({ children }: { children: React.ReactNode }) => {
  // Redirects to /sign-in without a session, or /onboarding without a handle.
  await requireMember();
  return <AppShell>{children}</AppShell>;
};

export default AppLayout;
