import type { Metadata } from 'next';
import type { AdminCohortSummary } from '@/lib/core/database';
import { requireStaff } from '@/lib/session';
import { CohortsConsole } from './cohorts-console';

export const metadata: Metadata = {
  title: 'Cohort operations',
  robots: { index: false, follow: false }
};

const Cohorts = async () => {
  // Cohort lifecycle is an admin power, not a moderator one.
  const { supabase } = await requireStaff({ adminOnly: true });
  const { data } = await supabase.rpc('admin_list_cohorts', { p_limit: 50 });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Cohort operations</h1>
        <p className="text-[17px] text-muted">Create cohorts and move them through their life.</p>
      </header>

      <CohortsConsole cohorts={(data ?? []) as AdminCohortSummary[]} />
    </div>
  );
};

export default Cohorts;
