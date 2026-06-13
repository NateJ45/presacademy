// Faculty directory filter island. A row of teaching-area chips that show or
// hide the server-rendered [data-faculty-card] elements via the shared
// .is-filtered-out utility. Multi-select (OR). Progressive enhancement: without
// JS every faculty member is visible.

import { useEffect, useState } from 'react';

interface Props {
  areas: { slug: string; label: string }[];
}

export default function FacultyFilter({ areas }: Props) {
  const [active, setActive] = useState<Set<string>>(new Set());

  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-faculty-card]'));
    for (const card of cards) {
      const a = (card.dataset.areas ?? '').split(' ').filter(Boolean);
      const ok = active.size === 0 || a.some((x) => active.has(x));
      card.classList.toggle('is-filtered-out', !ok);
    }
  }, [active]);

  function toggle(slug: string) {
    const next = new Set(active);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setActive(next);
  }

  if (areas.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by teaching area">
      <button
        type="button"
        onClick={() => setActive(new Set())}
        aria-pressed={active.size === 0}
        className={`rounded-[2px] border px-3 py-1 text-xs uppercase tracking-[0.1em] transition-colors ${
          active.size === 0 ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-foreground/70 hover:border-foreground'
        }`}
      >
        All
      </button>
      {areas.map((a) => {
        const on = active.has(a.slug);
        return (
          <button
            key={a.slug}
            type="button"
            onClick={() => toggle(a.slug)}
            aria-pressed={on}
            className={`rounded-[2px] border px-3 py-1 text-xs uppercase tracking-[0.1em] transition-colors ${
              on ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-foreground/70 hover:border-foreground'
            }`}
          >
            {a.label}
          </button>
        );
      })}
    </div>
  );
}
