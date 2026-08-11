'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<Theme | null>(null);

  // The inline script in layout.tsx already picked a theme before paint; read it
  // back rather than guessing a default and fighting it.
  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('steady30-theme', next);
    } catch {
      // Private browsing with storage blocked — the theme still applies for this page.
    }
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      className="grid size-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-line-strong hover:text-ink"
    >
      <span aria-hidden="true" className="text-[13px]">
        {theme === 'dark' ? '☀' : '☾'}
      </span>
    </button>
  );
};
