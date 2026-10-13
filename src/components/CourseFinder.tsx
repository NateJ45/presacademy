// Safe to edit by hand
// =============================================================================
// CourseFinder: the "reply card" course finder (Term Issue PR 2, 2026-10-13)
// =============================================================================
// Three questions, one suggested course. Rendered by
// src/components/blocks/CourseFinderBlock.astro, which resolves every course
// the card can suggest (with its cover colour and ornament) and the pricing
// tiers, then hands this island plain data. Hydrated client:visible: it sits
// below the fold, and the server render already shows the default suggestion,
// so a visitor without JavaScript still sees a real course and a working link.
//
// The rule lives in src/lib/term-issue.ts `finderPick` (unit tested): an answer
// to question 2 wins, else question 1, else the default. Question 3 lists the
// pricing tiers and only changes the price line.
//
// Accessibility:
//   - each answer is a <button aria-pressed>; one answer per question, and
//     pressing the chosen answer again clears it
//   - each question's answers sit in role="group" labelled by the question
//   - the suggestion is an aria-live="polite" region, so a screen reader hears
//     the new course after each tick
//   - the small cover is decoration (aria-hidden); the title is real text
//
// The card itself is static paper in both themes, like the course covers'
// backs: it sits on the static green chapel band, so it never theme-flips.
// =============================================================================
import { useState, type CSSProperties } from 'react';
import { finderPick } from '@/lib/term-issue';

export interface FinderCourse {
  title: string;
  href: string;
  code: string;
  area: string;
  /** "The Rev. Dr. Miriam Hale · Spring 2027 · waitlist" */
  who: string;
  /** coverStyle() output: the CSS custom properties for the cover colour. */
  style: string;
  ornament: string;
  color: string;
}

export interface FinderQuestion {
  question: string;
  options: { label: string; courseId: string | null }[];
}

export interface FinderPlan {
  name: string;
  price: string;
  note: string;
}

interface Props {
  idPrefix: string;
  kicker: string;
  heading: string;
  headingId: string;
  intro: string;
  questions: FinderQuestion[];
  question3: string;
  plans: FinderPlan[];
  defaultPlan: number;
  defaultCourseId: string | null;
  courses: Record<string, FinderCourse>;
  resultLabel: string;
  ctaLabel: string;
  ctaHref: string;
}

/** "a: b; c: d" -> { a: 'b', c: 'd' } for React's style prop. */
function styleObject(css: string): CSSProperties {
  const out: Record<string, string> = {};
  for (const part of css.split(';')) {
    const i = part.indexOf(':');
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out as CSSProperties;
}

/** The tick box beside each answer: an empty square, or a crossed one. */
function Box({ on }: { on: boolean }) {
  return (
    <svg className="reply-opt__box" viewBox="0 0 16 16" aria-hidden="true">
      <rect
        x="1"
        y="1"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {on && <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.75" />}
    </svg>
  );
}

export default function CourseFinder(props: Props) {
  const { questions, plans, courses } = props;
  // One pick per question: the index of the chosen answer, or -1 for none.
  const [picks, setPicks] = useState<number[]>(() => questions.map(() => -1));
  const [plan, setPlan] = useState<number>(props.defaultPlan);

  const chosen = (q: number): string | null => {
    const i = picks[q] ?? -1;
    const id = i >= 0 ? (questions[q]?.options[i]?.courseId ?? null) : null;
    return id && courses[id] ? id : null;
  };
  const courseId = finderPick(chosen(0), chosen(1), props.defaultCourseId);
  const course = courseId ? courses[courseId] : null;
  const p = plans[plan] ?? null;

  const toggle = (q: number, i: number) =>
    setPicks((prev) => prev.map((v, idx) => (idx === q ? (v === i ? -1 : i) : v)));

  const qLabelId = (n: number) => `${props.idPrefix}-q${n}`;

  return (
    <div className="reply-card">
      <div className="reply-card__questions">
        <p className="mono-detail reply-card__kicker">{props.kicker}</p>
        <h2 id={props.headingId} className="reply-card__heading">
          {props.heading}
        </h2>
        <p className="reply-card__intro">{props.intro}</p>
        <div className="reply-card__list">
          {questions.map((q, qi) => (
            <div key={qi} className="reply-q">
              <p id={qLabelId(qi + 1)} className="reply-q__label">
                <span className="reply-q__num" aria-hidden="true">
                  {String(qi + 1).padStart(2, '0')}
                </span>
                {q.question}
              </p>
              <div role="group" aria-labelledby={qLabelId(qi + 1)} className="reply-q__opts">
                {q.options.map((o, oi) => {
                  const on = picks[qi] === oi;
                  return (
                    <button
                      key={oi}
                      type="button"
                      className="reply-opt"
                      aria-pressed={on}
                      onClick={() => toggle(qi, oi)}
                    >
                      <Box on={on} />
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {plans.length > 0 && (
            <div className="reply-q">
              <p id={qLabelId(questions.length + 1)} className="reply-q__label">
                <span className="reply-q__num" aria-hidden="true">
                  {String(questions.length + 1).padStart(2, '0')}
                </span>
                {props.question3}
              </p>
              <div
                role="group"
                aria-labelledby={qLabelId(questions.length + 1)}
                className="reply-q__opts"
              >
                {plans.map((pl, pi) => {
                  const on = plan === pi;
                  return (
                    <button
                      key={pi}
                      type="button"
                      className="reply-opt"
                      aria-pressed={on}
                      onClick={() => setPlan(pi)}
                    >
                      <Box on={on} />
                      {pl.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="reply-card__result" aria-live="polite">
        <p className="mono-detail reply-card__muted">{props.resultLabel}</p>
        {course && (
          <>
            <div
              className="cover reply-card__cover"
              style={styleObject(course.style)}
              data-cover={course.color}
              aria-hidden="true"
            >
              <div className="cover__book">
                <div className="cover__face cover__front">
                  <div className="cover__front-inner">
                    <span className="cover__line">
                      {course.code && <span>{course.code}</span>}
                      {course.area && <span className="cover__topic">{course.area}</span>}
                    </span>
                    <span className="cover__orn" data-ornament={course.ornament} />
                    <div>
                      <span className="cover__title">{course.title}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="reply-card__title">
              <a href={course.href} className="hit-44">
                {course.title}
              </a>
            </p>
            {course.who && <p className="reply-card__muted">{course.who}</p>}
          </>
        )}
        {p && (
          <p className="reply-card__plan">
            <b>{p.name}</b> · {p.price}
            {p.note ? `. ${p.note}.` : '.'}
          </p>
        )}
        <a href={props.ctaHref} className="reply-card__cta press-tactile">
          {props.ctaLabel}
        </a>
      </div>
    </div>
  );
}
