import type { Metadata } from 'next';
import Link from 'next/link';
import { Card, CardTitle, Helper } from '@/components/ui';
import { requireStaff } from '@/lib/session';

export const metadata: Metadata = {
  title: 'Moderation console',
  robots: { index: false, follow: false }
};

const Stat = ({ label, value, hint }: { label: string; value: number; hint: string }) => (
  <Card>
    <span className="font-mono text-[11px] tracking-[0.1em] text-muted uppercase">{label}</span>
    <span className="tnum text-[40px] leading-none font-extrabold">{value}</span>
    <Helper>{hint}</Helper>
  </Card>
);

const AdminOverview = async () => {
  const { supabase } = await requireStaff();

  const [openReports, urgentReports, actions, guideApplications] = await Promise.all([
    supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open')
      .in('priority', ['high', 'urgent']),
    supabase.from('moderation_actions').select('*', { count: 'exact', head: true }),
    supabase.rpc('admin_list_peer_guide_applications', { p_limit: 50 })
  ]);

  const pendingGuides = (
    (guideApplications.data ?? []) as { status: string }[]
  ).filter((application) => application.status === 'pending').length;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Moderation console</h1>
        <p className="text-[17px] text-muted">
          Queues, cohort operations, and peer guide review.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Open reports"
          value={openReports.count ?? 0}
          hint="Awaiting a decision."
        />
        <Stat
          label="High or urgent"
          value={urgentReports.count ?? 0}
          hint="Review these first."
        />
        <Stat
          label="Guide applications"
          value={pendingGuides}
          hint="Pending review."
        />
        <Stat
          label="Actions recorded"
          value={actions.count ?? 0}
          hint="Every action is logged."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardTitle>Reports queue</CardTitle>
          <Helper>Ordered by response deadline, soonest first.</Helper>
          <Link href="/admin/reports" className="font-semibold underline underline-offset-[3px]">
            Open queue
          </Link>
        </Card>
        <Card>
          <CardTitle>Cohorts</CardTitle>
          <Helper>Create, activate, complete, or cancel.</Helper>
          <Link href="/admin/cohorts" className="font-semibold underline underline-offset-[3px]">
            Manage cohorts
          </Link>
        </Card>
        <Card>
          <CardTitle>Peer guides</CardTitle>
          <Helper>Approve, pause, or revoke alumni guides.</Helper>
          <Link href="/admin/guides" className="font-semibold underline underline-offset-[3px]">
            Review applications
          </Link>
        </Card>
      </div>

      <Card tone="tint">
        <CardTitle>Reminders for whoever is on duty</CardTitle>
        <ul className="flex list-disc flex-col gap-2 pl-5 text-muted">
          <li>
            Every action needs a reason code. The moderation runbook depends on them being
            accurate, not merely present.
          </li>
          <li>
            You can see reported content and member handles. You cannot see private reflections,
            and no console action should ever require them.
          </li>
          <li>
            Reports mentioning self-harm are not an emergency channel. Follow the escalation path in
            the runbook rather than replying in-product.
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default AdminOverview;
