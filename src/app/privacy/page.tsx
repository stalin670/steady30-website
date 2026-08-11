import type { Metadata } from 'next';
import { SiteShell } from '@/components/site-chrome';
import { Callout, LegalPage, Mail, P, Section } from '@/components/prose';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Steady30 privacy policy.'
};

const Privacy = () => (
  <SiteShell>
    <LegalPage
      eyebrow="Last updated: 11 August 2026"
      title="Privacy Policy"
      lede="Steady30 is a private, voluntary 30-day accountability practice for adults. This policy explains what information we handle, why, and the choices available to you."
    >
      <Section title="1. Information we handle">
        <P>
          We handle account information such as your email address, pseudonymous handle, and optional
          display name. If you use the app, we also handle the reflections, check-ins, challenge
          records, settings, and optional community posts or trusted-support requests that you choose
          to create.
        </P>
        <Callout>
          Information about sexual behaviour, reflections, and related inferences can be sensitive
          personal data. Please do not post private details publicly.
        </Callout>
      </Section>

      <Section title="2. Why we use it">
        <P>
          We use information to operate your account, provide the 30-day practice, display content
          you choose to share, protect the community, respond to support and deletion requests, and
          meet applicable legal obligations.
        </P>
      </Section>

      <Section title="3. No ads or behavioural analytics">
        <P>
          Steady30 does not sell, rent, or broker personal data. We do not use advertising networks,
          tracking pixels, or third-party behavioural analytics for challenge starts, check-ins,
          reflections, mood, urges, or relapse records. We do not use your reflections to train
          machine-learning models.
        </P>
      </Section>

      <Section title="4. Sharing">
        <P>
          Your private reflections are not visible to other members. Community posts and comments are
          shared only when you actively choose to publish them. Trusted contacts receive only the
          support signal you choose to send; they do not receive your private reflections, triggers,
          urge ratings, relapse records, or browsing activity.
        </P>
      </Section>

      <Section title="5. Service providers and security">
        <P>
          We use service providers to operate the service, including authentication and data-hosting
          infrastructure. Access is limited to what is necessary to operate and secure Steady30. No
          online service can promise absolute security; use a strong, unique password or secure
          access to your email account.
        </P>
      </Section>

      <Section title="6. Your choices and rights">
        <P>
          You can export your account data from the app. You can permanently delete your account and
          associated records in the app or through our public deletion page. We may retain limited
          information only where required by law or needed to resolve a security, fraud, or legal
          issue.
        </P>
      </Section>

      <Section title="7. Adults only">
        <P>
          Steady30 is for adults aged 18 and over. We do not knowingly provide the service to
          children.
        </P>
      </Section>

      <Section title="8. Contact">
        <P>
          For privacy questions, contact <Mail />. Do not send intimate reflection text or sensitive
          personal information by email.
        </P>
      </Section>
    </LegalPage>
  </SiteShell>
);

export default Privacy;
