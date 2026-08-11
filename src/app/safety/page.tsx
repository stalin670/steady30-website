import type { Metadata } from 'next';
import { SiteShell } from '@/components/site-chrome';
import { Callout, LegalPage, List, P, Section } from '@/components/prose';

export const metadata: Metadata = {
  title: 'Safety',
  description: 'Crisis support contacts and safety information for Steady30.'
};

const helplines = [
  { region: 'United States & Canada', detail: 'Call or text 988 (Suicide & Crisis Lifeline).' },
  { region: 'United Kingdom', detail: 'Call 111 for health advice, or 999 in a life-threatening emergency.' },
  { region: 'India', detail: 'Call Tele-MANAS 14416 or 1800-891-4416.' }
];

const Safety = () => (
  <SiteShell>
    <LegalPage eyebrow="Safety resources" title="Get support now.">
      <Callout variant="warning">
        Steady30 is not monitored for emergencies, mental-health crises, or medical emergencies. If
        you may be in immediate danger, contact local emergency services now.
      </Callout>

      <Section title="Immediate crisis support">
        <List>
          {helplines.map((line) => (
            <li key={line.region}>
              <strong className="text-ink">{line.region}:</strong> {line.detail}
            </li>
          ))}
          <li>
            <strong className="text-ink">Elsewhere:</strong> visit{' '}
            <a
              href="https://findahelpline.com/"
              rel="noopener noreferrer"
              className="underline underline-offset-[3px]"
            >
              findahelpline.com
            </a>{' '}
            to find free, confidential local support.
          </li>
        </List>
      </Section>

      <Section title="Professional support">
        <P>
          If sexual behaviour feels distressing, compulsive, or disruptive to your wellbeing,
          relationships, or work, consider speaking with a qualified and licensed mental-health or
          sexual-health professional. Steady30 is not a replacement for professional care.
        </P>
      </Section>

      <Section title="Using the community safely">
        <P>
          Do not share your real name, address, phone number, email address, financial information,
          or private reflection text in public posts. Use report and block tools for unsafe, abusive,
          or rule-breaking content.
        </P>
      </Section>
    </LegalPage>
  </SiteShell>
);

export default Safety;
