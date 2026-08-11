import type { Metadata } from 'next';
import Link from 'next/link';
import type {
  TrustedConnectionRow,
  TrustedSupportRequestRow
} from '@/lib/core/database';
import { requireMember } from '@/lib/session';
import { TrustedContactsView } from './trusted-contacts-view';

export const metadata: Metadata = {
  title: 'Trusted contacts',
  robots: { index: false, follow: false }
};

const TrustedContacts = async () => {
  const { supabase, user } = await requireMember();

  const [{ data: connections }, { data: requests }] = await Promise.all([
    supabase.from('trusted_connections').select('*').order('created_at', { ascending: false }),
    supabase
      .from('trusted_support_requests')
      .select('*')
      .eq('recipient_id', user.id)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
  ]);

  return (
    <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6 px-5 py-10">
      <header className="flex flex-col gap-2">
        <Link
          href="/today"
          className="self-start text-[14px] text-muted underline underline-offset-[3px] hover:text-ink"
        >
          ← Back to Today
        </Link>
        <h1 className="text-[clamp(28px,4vw,36px)] font-extrabold">Trusted contacts</h1>
        <p className="text-[17px] text-muted">Supportive accountability without surveillance.</p>
      </header>

      <TrustedContactsView
        connections={(connections ?? []) as TrustedConnectionRow[]}
        incomingRequests={(requests ?? []) as TrustedSupportRequestRow[]}
        myUserId={user.id}
      />
    </div>
  );
};

export default TrustedContacts;
