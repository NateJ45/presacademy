// Catalog filter island. Renders the topic / teacher / term filter rail and
// shows or hides the server-rendered [data-course-card] elements by toggling the
// shared .is-filtered-out utility (the same pattern the portfolio chips use).
// Faceted: within a group the match is OR, across groups it is AND. Cards stay
// server-rendered (good for SEO + no-JS), so this is pure progressive
// enhancement; without JS every course is visible.

import { useEffect, useState } from 'react';

interface Option {
  slug: string;
  label: string;
  count: number;
}

interface Props {
  topics: Option[];
  teachers: Option[];
  terms: { slug: string; label: string }[];
}

export default function CourseFilters({ topics, teachers, terms }: Props) {
  const [activeTopics, setActiveTopics] = useState<Set<string>>(new Set());
  const [activeTeachers, setActiveTeachers] = useState<Set<string>>(new Set());
  const [term, setTerm] = useState('');
  const [shown, setShown] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-course-card]'));
    setTotal(cards.length);
    let visible = 0;
    for (const card of cards) {
      const t = (card.dataset.topics ?? '').split(' ').filter(Boolean);
      const f = (card.dataset.teachers ?? '').split(' ').filter(Boolean);
      const termAttr = card.dataset.term ?? '';
      const topicOk = activeTopics.size === 0 || t.some((x) => activeTopics.has(x));
      const teacherOk = activeTeachers.size === 0 || f.some((x) => activeTeachers.has(x));
      const termOk = !term || termAttr === term;
      const ok = topicOk && teacherOk && termOk;
      card.classList.toggle('is-filtered-out', !ok);
      if (ok) visible++;
    }
    setShown(visible);
    const empty = document.querySelector<HTMLElement>('[data-course-empty]');
    if (empty) empty.hidden = visible !== 0;
  }, [activeTopics, activeTeachers, term]);

  function toggle(set: Set<string>, slug: string, setter: (s: Set<string>) => void) {
    const next = new Set(set);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setter(next);
  }

  function reset() {
    setActiveTopics(new Set());
    setActiveTeachers(new Set());
    setTerm('');
  }

  const anyActive = activeTopics.size > 0 || activeTeachers.size > 0 || term !== '';

  return (
    <aside aria-label="Filter courses" className="text-foreground">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-foreground/70">
          {shown != null && total != null ? (
            <>
              <span className="font-medium text-foreground">{shown}</span> of {total} courses
            </>
          ) : (
            <>&nbsp;</>
          )}
        </span>
        {anyActive && (
          <button
            type="button"
            onClick={reset}
            className="text-xs uppercase tracking-[0.12em] text-link underline underline-offset-2 hover:text-primary-dark"
          >
            Reset
          </button>
        )}
      </div>

      {topics.length > 0 && (
        <fieldset className="mt-6 border-0 p-0">
          <legend className="text-xs uppercase tracking-eyebrow text-foreground/80">Topic</legend>
          <div className="mt-3 flex flex-col gap-2">
            {topics.map((o) => (
              <label key={o.slug} className="flex cursor-pointer items-center gap-2 text-sm text-foreground/80">
                <input
                  type="checkbox"
                  checked={activeTopics.has(o.slug)}
                  onChange={() => toggle(activeTopics, o.slug, setActiveTopics)}
                  className="accent-[#7A2A2C]"
                />
                <span>{o.label}</span>
                <span className="text-secondary">({o.count})</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {teachers.length > 0 && (
        <fieldset className="mt-6 border-0 border-t border-border-soft p-0 pt-6">
          <legend className="text-xs uppercase tracking-eyebrow text-foreground/80">Teacher</legend>
          <div className="mt-3 flex flex-col gap-2">
            {teachers.map((o) => (
              <label key={o.slug} className="flex cursor-pointer items-center gap-2 text-sm text-foreground/80">
                <input
                  type="checkbox"
                  checked={activeTeachers.has(o.slug)}
                  onChange={() => toggle(activeTeachers, o.slug, setActiveTeachers)}
                  className="accent-[#7A2A2C]"
                />
                <span>{o.label}</span>
                <span className="text-secondary">({o.count})</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {terms.length > 0 && (
        <div className="mt-6 border-t border-border-soft pt-6">
          <label htmlFor="term-filter" className="text-xs uppercase tracking-eyebrow text-foreground/80">
            Term
          </label>
          <select
            id="term-filter"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="mt-3 w-full rounded-[2px] border border-border bg-card px-3 py-2 text-sm text-foreground"
          >
            <option value="">All upcoming terms</option>
            {terms.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </aside>
  );
}
