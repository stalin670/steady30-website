import type { Metadata } from 'next';
import type { ReportRow } from '@/lib/core/database';
import { requireStaff } from '@/lib/session';
import { ReportsQueue } from './reports-queue';

export const metadata: Metadata = {
  title: 'Reports queue',
  robots: { index: false, follow: false }
};

const Reports = async () => {
  const { supabase } = await requireStaff();

  // Soonest response deadline first — the SLA is the queue order.
  const { data } = await supabase
    .from('reports')
    .select('*')
    .eq('status', 'open')
    .order('response_due_at', { ascending: true, nullsFirst: false });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Reports queue</h1>
        <p className="text-[17px] text-muted">
          Open reports, ordered by response deadline.
        </p>
      </header>

      <ReportsQueue reports={(data ?? []) as ReportRow[]} />
    </div>
  );
};

export default Reports;
