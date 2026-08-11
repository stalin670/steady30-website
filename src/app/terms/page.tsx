import type { Metadata } from 'next';
import { SiteShell } from '@/components/site-chrome';
import { LegalPage, Mail, P, Section } from '@/components/prose';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern use of Steady30.'
};

const Terms = () => (
  <SiteShell>
    <LegalPage
      eyebrow="Last updated: 11 August 2026"
      title="Terms of Service"
      lede="These terms govern use of Steady30. By creating an account or using the service, you agree to them."
    >
      <Section title="1. Eligibility">
        <P>
          Steady30 is strictly for adults aged 18 and over. You must be legally able to agree to
          these terms and use the service voluntarily.
        </P>
      </Section>

      <Section title="2. What Steady30 provides">
        <P>
          Steady30 provides educational self-help material, personal reflection tools, and optional
          peer accountability features. It does not provide medical, psychiatric, or clinical advice,
          diagnosis, treatment, therapy, or emergency monitoring.
        </P>
      </Section>

      <Section title="3. Your account and content">
        <P>
          You are responsible for information you submit and for keeping access to your account
          secure. Use a pseudonymous handle if you prefer. You retain responsibility for content you
          publish to the optional community.
        </P>
      </Section>

      <Section title="4. Community rules">
        <P>
          Do not post explicit sexual content, external links, contact solicitations, harassment,
          hate, shaming, impersonation, spam, or unsubstantiated medical claims. We may remove
          content or suspend accounts that break these rules or create a safety risk.
        </P>
      </Section>

      <Section title="5. Subscriptions">
        <P>
          The core 30-day challenge, daily check-ins, community support, trusted contacts, and safety
          resources are free. Optional Steady30 Plus features, if offered, are billed and managed
          through the relevant app store. Store-specific subscription, renewal, cancellation, and
          refund terms apply.
        </P>
      </Section>

      <Section title="6. Service changes and termination">
        <P>
          We may change, suspend, or discontinue parts of the service where reasonably necessary,
          including for safety, legal, or operational reasons. You can stop using Steady30 and
          request deletion at any time.
        </P>
      </Section>

      <Section title="7. Contact">
        <P>
          Questions about these terms can be sent to <Mail />.
        </P>
      </Section>
    </LegalPage>
  </SiteShell>
);

export default Terms;
