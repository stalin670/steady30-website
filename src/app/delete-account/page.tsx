import type { Metadata } from 'next';
import { SiteShell } from '@/components/site-chrome';
import { LegalPage, Mail, P, Section } from '@/components/prose';

export const metadata: Metadata = {
  title: 'Delete your account',
  description: 'How to permanently delete your Steady30 account and associated data.'
};

const steps = [
  'Open Settings.',
  'Choose Your data & account.',
  'Select Delete my account and confirm.'
];

const DeleteAccount = () => (
  <SiteShell>
    <LegalPage
      eyebrow="Account deletion"
      title="Delete your Steady30 account."
      lede="You can permanently delete your account and associated information from the app. This is the fastest and most secure route."
    >
      <Section title="Delete in the app">
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-muted">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </Section>

      <Section title="If you cannot access the app">
        <P>
          Email <Mail subject="Account deletion request" /> from the email address associated with
          your account, with the subject “Account deletion request.” Do not include reflections,
          check-ins, or other sensitive details in the email.
        </P>
      </Section>

      <Section title="What deletion removes">
        <P>
          Deletion removes your account profile, challenge attempts, check-ins, reflections, relapse
          notes, coping plans, trusted-support records, and content you authored in the optional
          community, except for limited data we must keep where legally required or needed to resolve
          a security, fraud, or legal issue.
        </P>
      </Section>
    </LegalPage>
  </SiteShell>
);

export default DeleteAccount;
