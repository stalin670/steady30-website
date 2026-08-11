import type { Metadata } from 'next';
import { SiteShell } from '@/components/site-chrome';
import { SteadyNow } from './steady-now';

export const metadata: Metadata = {
  title: 'Steady Now',
  description: 'Create ten minutes between an urge and a decision. No account needed.'
};

const SteadyNowPage = () => (
  <SiteShell>
    <SteadyNow />
  </SiteShell>
);

export default SteadyNowPage;
