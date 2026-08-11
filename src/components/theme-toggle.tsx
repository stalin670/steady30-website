'use client';

/**
 * No React state here on purpose.
 *
 * The inline script in layout.tsx already put the resolved theme on
 * <html data-theme>, so the correct icon can be chosen by CSS. Mirroring that
 * into state would mean a mount-time effect, a cascading render, and an SSR/client
 * mismatch on the icon — for a control whose whole job is one attribute flip.
 */
export const ThemeToggle = () => {
  const toggle = () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('steady30-theme', next);
    } catch {
      // Private browsing with storage blocked — the theme still applies here.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      className="grid size-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-line-strong hover:text-ink"
    >
      <span aria-hidden="true" className="text-[13px] dark:hidden">
        ☾
      </span>
      <span aria-hidden="true" className="hidden text-[13px] dark:inline">
        ☀
      </span>
    </button>
  );
};
