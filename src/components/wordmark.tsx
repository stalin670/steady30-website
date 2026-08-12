import Link from 'next/link';

export const Wordmark = ({ href = '/' }: { href?: string }) => (
  <Link
    href={href}
    className="flex items-center gap-2.5 text-[20px] font-extrabold tracking-[-0.5px]"
  >
    <span aria-hidden="true" className="steady30-mark" />
    Steady30
  </Link>
);
