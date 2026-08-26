// Foundation, edit with care
// =============================================================================
// The built-in FAQ starter set (extracted 2026-08-26)
// =============================================================================
// These questions rendered inline in src/pages/faq.astro until the page moved
// to the builder (Phase 2 of
// docs/superpowers/plans/2026-08-26-page-builder-conversion.md). They live here
// now because TWO places need the identical list and must never drift:
//
//   - FaqGroupedBlock.astro renders them when the faqItem collection is empty
//     (a fresh dataset, or the credential-less CI build).
//   - faq.astro builds the FAQPage JSON-LD, which stays page-level by doctrine
//     and has to describe exactly what the page shows.
//
// Answers here are plain strings; answers from the collection are Portable
// Text. Both renderers handle either, on purpose: this is the one place in the
// codebase where an answer can legitimately be either shape.
export interface FallbackFaq {
  category: string;
  question: string;
  answer: string;
}

export const FALLBACK_FAQS: FallbackFaq[] = [
  { category: 'Courses & Format', question: 'How do courses work?', answer: 'Each course meets in person, in a cohort, over six to ten evenings. You read real texts, discuss them together, and leave able to teach what you have learned.' },
  { category: 'Courses & Format', question: 'Do I need a degree or prior training?', answer: 'No. Our courses are built for adult lay leaders and curious believers. We meet you where you are.' },
  { category: 'Courses & Format', question: 'Where do classes meet?', answer: 'On our West Chester campus, with free on-site parking. Most courses meet on weekday evenings.' },
  { category: 'Cost & Scholarships', question: 'What does a course cost?', answer: 'Most courses are $195, or $95 to audit. A full certificate track is $1,400. See the Pricing page for the details.' },
  { category: 'Cost & Scholarships', question: 'What if I cannot afford it?', answer: 'Need-based scholarships are available every term, funded by our supporters. No one is turned away for cost. Just tell us on the interest form.' },
  { category: "Who It's For", question: 'Who takes courses here?', answer: 'Ruling and teaching elders, small-group and Sunday-school leaders, lifelong learners from PC(USA), ECO, and EPC churches, and anyone discerning a call.' },
  { category: "Who It's For", question: 'Can I take a course if I am not Presbyterian?', answer: 'Yes. Reformed Christians of every stripe, and the simply curious, are welcome.' },
  { category: 'Reformed Identity', question: 'What do you believe?', answer: 'We are a confessional Reformed school in the PC(USA), holding to the Westminster Standards and the Book of Confessions, taught for ordinary believers.' },
  { category: 'Reformed Identity', question: 'Is this a seminary?', answer: 'No. We are a lay-formation school. The teaching is seminary-grade, but it is built for people who are not leaving their jobs and families for a degree.' },
  { category: 'Getting Started', question: 'How do I try before I enroll?', answer: 'Sit in on the first session of any course, free, or book a free intro session. Request information and we will help you find a fit.' },
  { category: 'Getting Started', question: 'When do courses start?', answer: 'We run cohorts each term. The next term and its dates are on the home page and the Events page.' },
];

/** The order the built-in categories are shown in when no editor order is set. */
export const DEFAULT_CATEGORY_ORDER = [
  'Courses & Format',
  'Cost & Scholarships',
  "Who It's For",
  'Reformed Identity',
  'Getting Started',
];

/**
 * Group questions into the given category order, dropping empty categories, and
 * appending any category present in the data but missing from the order list so
 * a new category can never silently hide its questions.
 *
 * Lifted verbatim out of faq.astro; the block renders the result and the page's
 * JSON-LD is built from the same flat list that goes in.
 */
export function groupFaqs(
  faqs: any[],
  categoryOrder: string[],
): { category: string; items: any[] }[] {
  const grouped = categoryOrder
    .map((cat) => ({ category: cat, items: faqs.filter((f) => f.category === cat) }))
    .filter((g) => g.items.length > 0);
  const known = new Set(categoryOrder);
  for (const f of faqs) {
    if (f.category && !known.has(f.category)) {
      known.add(f.category);
      grouped.push({ category: f.category, items: faqs.filter((x) => x.category === f.category) });
    }
  }
  return grouped;
}
