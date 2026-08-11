import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://steady30.online'),
  title: {
    default: 'Steady30 — One honest day at a time',
    template: '%s — Steady30'
  },
  description:
    'Steady30 is a private, adult-only 30-day accountability practice: one honest day at a time.',
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F1F1ED' },
    { media: '(prefers-color-scheme: dark)', color: '#101010' }
  ]
};

// Runs before first paint so the page never flashes the wrong theme. Kept as a
// string because it has to execute ahead of hydration.
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('steady30-theme');
    var system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    document.documentElement.dataset.theme = stored === 'dark' || stored === 'light' ? stored : system;
  } catch (e) {
    document.documentElement.dataset.theme = 'light';
  }
})();
`;

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" suppressHydrationWarning>
    <head>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
    </head>
    <body>{children}</body>
  </html>
);

export default RootLayout;
