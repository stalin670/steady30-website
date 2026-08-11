import type { Metadata } from 'next';
import { SiteShell } from '@/components/site-chrome';
import { LegalPage, List, P, Section } from '@/components/prose';

export const metadata: Metadata = {
  title: 'About',
  description: 'The scientific approach, values, and evidence standards behind Steady30.'
};

// Copy carried over from ../Steady30/src/screens/about-screen.tsx. These are
// evidence claims — do not paraphrase or extend them without a content review.
const citations = [
  {
    source: 'Mayo Clinic',
    detail:
      'Compulsive sexual behavior symptoms, causes, and recommendations for licensed professional therapy when distress is severe.'
  },
  {
    source: 'VA CBT Urge Surfing',
    detail:
      'Instructions on mindfulness-based somatic awareness for riding out acute craving spikes without behavioral escalation.'
  },
  {
    source: 'Evidence labels',
    detail:
      'Every published lesson identifies its evidence level, reviewer credentials, intended outcome, limitations, sources, and review date. A citation is not presented as proof of a claim by itself.'
  }
];

const isNot = [
  'Not medical treatment, clinical therapy, or psychiatric diagnosis.',
  'Not an automated blocker, VPN filter, or surveillance software.',
  'Not a platform for minors or explicit content sharing.'
];

const About = () => (
  <SiteShell>
    <LegalPage
      eyebrow="Scientific approach, values, and evidence"
      title="About Steady30"
      lede="An intentional 30-day challenge for adults who voluntarily wish to pause pornography viewing and masturbation."
    >
      <Section title="Mission and philosophy">
        <P>
          Our mission is to provide structured accountability without shame, moral condemnation, or
          pseudoscientific health claims. The practice is voluntary, private by default, and yours to
          leave at any point.
        </P>
      </Section>

      <Section title="Content standards">
        <P>
          Curriculum lessons are published only after an independent qualified reviewer checks the
          source, intended outcome, limitations, safety language, and review date. Draft lessons
          remain unavailable to members.
        </P>
        <div className="flex flex-col gap-4 pt-2">
          {citations.map((citation) => (
            <div key={citation.source} className="border-l-2 border-primary pl-4">
              <p className="font-semibold">{citation.source}</p>
              <p className="mt-0.5 text-[15px] text-muted">{citation.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="What Steady30 is not">
        <List>
          {isNot.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </List>
      </Section>
    </LegalPage>
  </SiteShell>
);

export default About;
