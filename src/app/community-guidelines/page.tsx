import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteShell } from '@/components/site-chrome';
import { LegalPage, List, Mail, P, Section } from '@/components/prose';

export const metadata: Metadata = {
  title: 'Community Guidelines',
  description: 'Rules for respectful peer accountability in the Steady30 community.'
};

const rules = [
  'No explicit sexual descriptions, pornography, or erotic content.',
  'No external links, domain names, contact details, or requests to move conversations off-platform.',
  'No harassment, hate, threats, shaming, or coercion.',
  'No impersonation, spam, scams, or unsubstantiated medical claims.',
  'Do not post personal information or another person’s information.'
];

const CommunityGuidelines = () => (
  <SiteShell>
    <LegalPage
      eyebrow="Optional text-only peer support"
      title="Community guidelines"
      lede="The Steady30 community is for respectful, practical peer accountability — not explicit discussion, medical advice, or crisis support."
    >
      <Section title="Keep it safe and supportive">
        <List>
          {rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </List>
      </Section>

      <Section title="Reporting and blocking">
        <P>
          Use the in-app report and block controls when content violates these guidelines. Reports
          are reviewed by human moderators. Reporting is not an emergency service; if there is
          immediate danger, use the resources on the{' '}
          <Link href="/safety" className="underline underline-offset-[3px]">
            Safety page
          </Link>
          .
        </P>
      </Section>

      <Section title="Moderation">
        <P>
          We may remove content or suspend accounts that break these rules or create a safety risk.
          You can contact <Mail /> for moderation concerns without sending intimate or sensitive
          details.
        </P>
      </Section>
    </LegalPage>
  </SiteShell>
);

export default CommunityGuidelines;
