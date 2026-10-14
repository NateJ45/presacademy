// Foundation, edit with care
// Theme control: a small Light / Dark segmented control (the 2026-10-13
// masthead redesign; it used to be a single icon button cycling light -> dark
// -> system). LIGHT is the default for a new visitor (no saved choice). The
// choice persists to localStorage under site.themeStorageKey, the same key and
// the same values ('light' | 'dark' | 'system') as before, so a visitor's saved
// choice survives the redesign. A stored 'system' (from the old cycle) keeps
// following the OS, as it always did, until the visitor picks Light or Dark.
// The anti-FOUC script in BaseLayout applies the resolved class on first
// paint; this component only switches and re-applies.
//
// Which half LOOKS selected is decided by CSS from the `dark` class on <html>
// (the .theme-seg rules in globals.css), not by React state, so the control is
// right from the first paint even before the island hydrates. aria-pressed
// arrives with hydration.
//
// Two looks, by `variant`:
//   'bar'    cream outline pill for the green top bar of the masthead
//   'sheet'  square ink outline for the foot of the phone Contents menu

import { useEffect, useState } from 'react';
import { site } from '@/data/site';

type Theme = 'light' | 'dark' | 'system';
const KEY = site.themeStorageKey;

function prefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme(theme: Theme) {
  const dark = theme === 'dark' || (theme === 'system' && prefersDark());
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  // Keep theme-aware images (an uploaded header logo) in sync. The light/dark
  // srcs are stored on each img as data attributes.
  const imgs = document.querySelectorAll<HTMLImageElement>('img[data-theme-logo]');
  imgs.forEach((img) => {
    const nextSrc = dark ? img.dataset.logoDarkSrc : img.dataset.logoLightSrc;
    const nextSrcset = dark ? img.dataset.logoDarkSrcset : img.dataset.logoLightSrcset;
    if (nextSrc && img.src !== nextSrc) img.src = nextSrc;
    if (nextSrcset && img.srcset !== nextSrcset) img.srcset = nextSrcset;
  });
  // Every mounted control (the masthead's and the menu's) re-reads the state.
  window.dispatchEvent(new CustomEvent('pa:theme-change'));
}

function readStored(): Theme {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'dark' || v === 'system' ? v : 'light';
  } catch {
    return 'light';
  }
}

interface Props {
  variant?: 'bar' | 'sheet';
}

export default function ThemeToggle({ variant = 'bar' }: Props) {
  // null until mounted: the server cannot know, so it renders no aria-pressed.
  const [resolved, setResolved] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    const sync = () =>
      setResolved(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    sync();
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onOs = () => {
      if (readStored() === 'system') applyTheme('system');
    };
    mq.addEventListener('change', onOs);
    window.addEventListener('pa:theme-change', sync);
    return () => {
      mq.removeEventListener('change', onOs);
      window.removeEventListener('pa:theme-change', sync);
    };
  }, []);

  const choose = (next: 'light' | 'dark') => {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Private mode: the choice still applies for this page view.
    }
    applyTheme(next);
  };

  return (
    <div role="group" aria-label="Colour theme" className={`theme-seg theme-seg--${variant}`}>
      {(['light', 'dark'] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          data-mode={mode}
          className="theme-seg__opt"
          aria-pressed={resolved === null ? undefined : resolved === mode}
          onClick={() => choose(mode)}
        >
          {mode === 'light' ? 'Light' : 'Dark'}
        </button>
      ))}
    </div>
  );
}
