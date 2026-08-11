import type { ReactNode } from 'react';

/**
 * Shared layout for the legal and reference pages. The copy on these pages is the
 * published Google Play policy text — it is carried over verbatim from the static
 * site and should only change with a deliberate review.
 */
export const LegalPage = ({
  eyebrow,
  title,
  lede,
  children
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  children: ReactNode;
}) => (
  <article className="mx-auto w-full max-w-[800px] px-5 py-16">
    <p className="mb-3 font-mono text-[11px] font-bold tracking-[0.12em] text-muted uppercase">
      {eyebrow}
    </p>
    <h1 className="text-[clamp(34px,6vw,48px)] font-extrabold">{title}</h1>
    {lede ? <p className="mt-6 text-[17px] text-muted">{lede}</p> : null}
    <div className="flex flex-col gap-9 pt-9">{children}</div>
  </article>
);

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="flex flex-col gap-3">
    <h2 className="text-[22px] font-bold">{title}</h2>
    {children}
  </section>
);

export const P = ({ children }: { children: ReactNode }) => (
  <p className="text-muted">{children}</p>
);

export const List = ({ children }: { children: ReactNode }) => (
  <ul className="flex list-disc flex-col gap-2 pl-5 text-muted">{children}</ul>
);

export const Callout = ({
  children,
  variant = 'accent'
}: {
  children: ReactNode;
  variant?: 'accent' | 'warning';
}) => (
  <p
    className={`rounded-r-xl border-l-4 px-5 py-4 text-ink ${
      variant === 'warning'
        ? 'border-danger bg-danger-muted'
        : 'border-accent bg-accent-muted'
    }`}
  >
    {children}
  </p>
);

export const Mail = ({ subject }: { subject?: string }) => (
  <a
    className="underline underline-offset-[3px]"
    href={`mailto:support@steady30.online${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`}
  >
    support@steady30.online
  </a>
);
