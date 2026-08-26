import { useCallback, useEffect, useState } from 'react';
import { useClient } from 'sanity';
import { Badge, Box, Button, Card, Flex, Heading, Spinner, Stack, Text } from '@sanity/ui';

// =============================================================================
// HealthTool — a plain-language "what needs attention?" checkup (navbar tool)
// =============================================================================
// Read-only. Runs a handful of high-signal queries and reports what an editor
// would want to fix: courses missing their basics, faculty without a portrait
// or bio, terms that have started but still read "upcoming", notices past
// their end date, unassigned FAQs, empty SEO fields, and drafts waiting to
// publish. No mutations — it just points; you fix in the normal editor.
// =============================================================================

type Severity = 'alert' | 'warn' | 'info' | 'ok';

interface CheckResult {
  id: string;
  severity: Severity;
  label: string;
  detail: string;
}

interface Check {
  id: string;
  // Returns null when all-good, or a {severity,label,detail} when something's up.
  run: (client: ReturnType<typeof useClient>) => Promise<Omit<CheckResult, 'id'> | null>;
}

const LIVE = '!(_id in path("drafts.**")) && archived != true';

function names(list: { label?: string }[], max = 6): string {
  const shown = list
    .map((x) => x.label || 'Untitled')
    .slice(0, max)
    .join(', ');
  return list.length > max ? `${shown}…` : shown;
}

const CHECKS: Check[] = [
  {
    // Courses missing the fields the catalog card leans on.
    id: 'course-basics',
    run: async (c) => {
      const rows = await c.fetch<{ label?: string }[]>(
        `*[_type == "course" && ${LIVE} && (
          !defined(coverImage) || !defined(summary) || count(instructors) == 0
        )]{ "label": title }`,
      );
      return rows.length
        ? {
            severity: 'warn',
            label: `${rows.length} course${rows.length === 1 ? '' : 's'} missing a cover image, summary, or instructor`,
            detail: `The catalog card leans on all three. Fill in the gaps: ${names(rows)}.`,
          }
        : null;
    },
  },
  {
    // Courses with no offering at all — they never show a "next cohort".
    id: 'course-no-term',
    run: async (c) => {
      const rows = await c.fetch<{ label?: string }[]>(
        `*[_type == "course" && ${LIVE} && count(offerings) == 0]{ "label": title }`,
      );
      return rows.length
        ? {
            severity: 'info',
            label: `${rows.length} course${rows.length === 1 ? '' : 's'} with no offering (no term)`,
            detail: `Without an offering pointing at a term, a course never shows a "next cohort begins" line: ${names(rows)}.`,
          }
        : null;
    },
  },
  {
    id: 'faculty-basics',
    run: async (c) => {
      const rows = await c.fetch<{ label?: string }[]>(
        `*[_type == "facultyMember" && ${LIVE} && (!defined(photo) || !defined(bio))]{ "label": name }`,
      );
      return rows.length
        ? {
            severity: 'warn',
            label: `${rows.length} faculty member${rows.length === 1 ? '' : 's'} missing a portrait or bio`,
            detail: `A profile without a face or a story undercuts the course it teaches: ${names(rows)}.`,
          }
        : null;
    },
  },
  {
    // One-time events whose date has passed. The site retires them on its own,
    // but the pile-up clutters the Studio list.
    id: 'events-past',
    run: async (c) => {
      const n = await c.fetch<number>(
        `count(*[_type == "event" && ${LIVE} && eventType == "oneTime" && defined(start) && coalesce(end, start) < now()])`,
      );
      return n > 0
        ? {
            severity: 'info',
            label: `${n} one-time event${n === 1 ? '' : 's'} already past`,
            detail:
              'They no longer show on the site, but clearing them out (Delete moves them to the trash) keeps the Events list tidy.',
          }
        : null;
    },
  },
  {
    // Terms that already started but still say "upcoming" / "registration open".
    id: 'terms-stale',
    run: async (c) => {
      const rows = await c.fetch<{ label?: string }[]>(
        `*[_type == "term" && ${LIVE} && defined(startDate) && startDate < now() && status in ["upcoming", "open"]]{ "label": title }`,
      );
      return rows.length
        ? {
            severity: 'warn',
            label: `${rows.length} term${rows.length === 1 ? '' : 's'} already started but still marked upcoming`,
            detail: `Update each term's Status so the site's cohort lines stay honest: ${names(rows)}.`,
          }
        : null;
    },
  },
  {
    id: 'ann-expired',
    run: async (c) => {
      const n = await c.fetch<number>(
        `count(*[_type == "announcement" && ${LIVE} && enabled == true && defined(endDate) && endDate < now()])`,
      );
      return n > 0
        ? {
            severity: 'warn',
            label: `${n} announcement${n === 1 ? '' : 's'} past its end date but still on`,
            detail: 'Turn it off, or clear its End date. (Banners also stop showing on their own.)',
          }
        : null;
    },
  },
  {
    // FAQs with no category never group properly on the FAQ page.
    id: 'faq-uncategorized',
    run: async (c) => {
      const rows = await c.fetch<{ label?: string }[]>(
        `*[_type == "faqItem" && ${LIVE} && !defined(categoryRef) && !defined(category)]{ "label": question }`,
      );
      return rows.length
        ? {
            severity: 'warn',
            label: `${rows.length} FAQ${rows.length === 1 ? '' : 's'} without a category`,
            detail: `Uncategorized questions can land in an odd spot on the FAQ page: ${names(rows)}.`,
          }
        : null;
    },
  },
  {
    // Empty SEO descriptions on the page-like docs Google leans on most.
    id: 'seo-gaps',
    run: async (c) => {
      const rows = await c.fetch<{ label?: string }[]>(
        `*[_type in ["homePage","aboutPage","coursesPage","facultyPage","pricingPage","getStartedPage","forYouPage","resourcesPage","faqPage","contactPage","eventsPage","page"]
          && !(_id in path("drafts.**")) && archived != true && !defined(seoDescription)]{ "label": coalesce(title, _type) }`,
      );
      return rows.length
        ? {
            severity: 'info',
            label: `${rows.length} page${rows.length === 1 ? '' : 's'} without an SEO description`,
            detail: `Google writes its own snippet when this is empty. Worth filling in: ${names(rows)}. Each page's SEO tab has an "SEO preview" view.`,
          }
        : null;
    },
  },
  {
    // "Waiting to publish" — every document with unpublished edits, oldest first.
    id: 'drafts',
    run: async (c) => {
      const drafts = await c.fetch<{ _type: string; label?: string; _updatedAt: string }[]>(
        `*[_id in path("drafts.**")] | order(_updatedAt asc) {
          _type, _updatedAt,
          "label": coalesce(title, name, question, quote, message, _type)
        }`,
      );
      if (drafts.length === 0) return null;
      const days = Math.floor(
        (Date.now() - new Date(drafts[0]._updatedAt).getTime()) / (1000 * 60 * 60 * 24),
      );
      return {
        severity: 'warn',
        label: `${drafts.length} edit${drafts.length === 1 ? '' : 's'} waiting to publish`,
        detail: `These have changes nobody can see yet: ${names(drafts)}. ${
          days > 0 ? `The oldest has waited ${days} day${days === 1 ? '' : 's'}. ` : ''
        }Open each one and Publish, or discard the draft.`,
      };
    },
  },
];

const SEV_BADGE: Record<
  Severity,
  { tone: 'critical' | 'caution' | 'primary' | 'positive'; text: string }
> = {
  alert: { tone: 'critical', text: 'Heads up' },
  warn: { tone: 'caution', text: 'Worth a look' },
  info: { tone: 'primary', text: 'Tidy up' },
  ok: { tone: 'positive', text: 'All clear' },
};

const SEV_RANK: Record<Severity, number> = { alert: 0, warn: 1, info: 2, ok: 3 };

export function HealthTool() {
  const client = useClient({ apiVersion: '2025-01-01' });
  const [results, setResults] = useState<CheckResult[] | null>(null);
  const [busy, setBusy] = useState(false);

  const runAll = useCallback(async () => {
    setBusy(true);
    try {
      const found: CheckResult[] = [];
      for (const check of CHECKS) {
        try {
          const r = await check.run(client);
          if (r) found.push({ id: check.id, ...r });
        } catch {
          /* skip a failing check rather than break the whole report */
        }
      }
      found.sort((a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity]);
      setResults(found);
    } finally {
      setBusy(false);
    }
  }, [client]);

  useEffect(() => {
    void runAll();
  }, [runAll]);

  return (
    <Box padding={4}>
      <Stack space={5} style={{ maxWidth: 640, margin: '0 auto' }}>
        <Stack space={3}>
          <Heading size={3}>🩺 Content checkup</Heading>
          <Text size={2} muted style={{ lineHeight: 1.5 }}>
            A quick look for things worth fixing: courses or faculty missing their basics, terms
            and notices gone stale, empty SEO fields, and edits waiting to publish. Nothing is
            changed here; it just points you to what to check.
          </Text>
        </Stack>

        <Flex>
          <Button
            text={busy ? 'Checking…' : 'Check again'}
            mode="ghost"
            disabled={busy}
            onClick={() => void runAll()}
          />
        </Flex>

        {results === null ? (
          <Flex align="center" gap={2}>
            <Spinner muted />
            <Text size={1} muted>
              Checking…
            </Text>
          </Flex>
        ) : results.length === 0 ? (
          <Card padding={4} radius={3} tone="positive" border>
            <Flex align="center" gap={3}>
              <Badge tone="positive" padding={2} fontSize={1}>
                All clear
              </Badge>
              <Text size={2}>Nothing needs attention right now. Nice work.</Text>
            </Flex>
          </Card>
        ) : (
          <Stack space={3}>
            {results.map((r) => {
              const b = SEV_BADGE[r.severity];
              return (
                <Card key={r.id} padding={4} radius={3} border tone={b.tone}>
                  <Stack space={3}>
                    <Flex align="center" gap={3}>
                      <Badge tone={b.tone} padding={2} fontSize={1}>
                        {b.text}
                      </Badge>
                      <Text size={2} weight="semibold">
                        {r.label}
                      </Text>
                    </Flex>
                    <Text size={1} muted style={{ lineHeight: 1.5 }}>
                      {r.detail}
                    </Text>
                  </Stack>
                </Card>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
