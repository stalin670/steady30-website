import Link from 'next/link';
import { SiteShell } from '@/components/site-chrome';

const NotFound = () => (
  <SiteShell>
    <div className="mx-auto flex w-full max-w-[680px] flex-col items-start gap-6 px-5 py-24">
      <p className="font-mono text-[11px] font-bold tracking-[0.14em] text-muted uppercase">
        Page not found
      </p>
      <h1 className="text-[clamp(34px,6vw,46px)] font-extrabold">
        That page isn’t here.
      </h1>
      <p className="text-[19px] text-muted">
        The link may be out of date. Everything Steady30 does is listed on the features page.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/features"
          className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 font-bold text-on-primary hover:bg-primary-hover"
        >
          See all features
        </Link>
        <Link
          href="/steady-now"
          className="inline-flex min-h-12 items-center justify-center rounded-full border border-line-strong px-6 font-bold hover:bg-card-hover"
        >
          Open Steady Now
        </Link>
      </div>
    </div>
  </SiteShell>
);

export default NotFound;
