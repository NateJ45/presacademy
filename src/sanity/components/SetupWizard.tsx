import { useCallback, useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import { useClient, useWorkspace } from 'sanity';
import { ToolHeading } from './ToolHeading';
import { IntentLink, useRouter } from 'sanity/router';
import { Badge, Box, Card, Flex, Spinner, Stack, Text } from '@sanity/ui';

// =============================================================================
// SetupWizard — the "new term, roll the site over" checklist (navbar tool)
// =============================================================================
// Read-only, like the Checkup tool: it reads a few counts and lays out the
// start-of-term tasks in order, each with a live status (done / to-do / check)
// and a one-click jump to the exact place to fix it. It never changes anything;
// editors edit and publish in the normal editor. Links go through IntentLink /
// router.navigateUrl so they work in hash- and browser-routed Studios alike.
// =============================================================================

type Status = 'done' | 'todo' | 'info';

interface Step {
  key: string;
  icon: string;
  title: string;
  detail: string;
  status: Status;
  intent?: ComponentProps<typeof IntentLink>['intent'];
  params?: Record<string, string>;
  /** Router path incl. workspace basePath, e.g. `${basePath}/structure/catalog;term`. */
  path?: string;
  linkText: string;
}

interface Section {
  heading: string;
  steps: Step[];
}

interface SetupData {
  nextTerm: { title?: string; startDate?: string; status?: string } | null;
  coursesWithoutFutureOffering: number;
  liveCourses: number;
  tiers: number;
  futureTermStartEvents: number;
  expiredAnnouncements: number;
}

const LIVE = '!(_id in path("drafts.**")) && archived != true';

const SETUP_QUERY = `{
  "nextTerm": *[_type == "term" && ${LIVE} && defined(startDate) && startDate >= now()] | order(startDate asc)[0]{ title, startDate, status },
  "coursesWithoutFutureOffering": count(*[_type == "course" && ${LIVE} && count(offerings[term->startDate >= now()]) == 0]),
  "liveCourses": count(*[_type == "course" && ${LIVE}]),
  "tiers": count(*[_type == "pricingTier" && ${LIVE}]),
  "futureTermStartEvents": count(*[_type == "event" && ${LIVE} && category == "Term start" && defined(start) && start >= now()]),
  "expiredAnnouncements": count(*[_type == "announcement" && ${LIVE} && enabled == true && defined(endDate) && endDate < now()])
}`;

const STATUS_LABEL: Record<string, string> = {
  upcoming: 'Upcoming',
  open: 'Registration open',
  inSession: 'In session',
  closed: 'Closed',
};

function buildSections(data: SetupData, basePath: string): Section[] {
  const t = data.nextTerm;
  const termsPane = `${basePath}/structure/catalog;term`;
  const coursesPane = `${basePath}/structure/catalog;course`;

  return [
    {
      heading: 'The term itself',
      steps: [
        {
          key: 'create-term',
          icon: '🗓️',
          title: 'Create the new term',
          detail: t
            ? `"${t.title ?? 'Untitled term'}" is on file, starting ${t.startDate ?? '(no date)'}. The whole site's "next cohort" lines read from it.`
            : 'No future term exists yet. Add one (name, start date, apply-by date) so courses have a season to point at.',
          status: t ? 'done' : 'todo',
          intent: t ? undefined : 'create',
          params: t ? undefined : { type: 'term' },
          path: t ? termsPane : undefined,
          linkText: t ? 'Open Terms' : 'Add the term',
        },
        {
          key: 'term-status',
          icon: '📝',
          title: 'Set the enrollment status',
          detail: t
            ? `The next term reads: ${STATUS_LABEL[t.status ?? ''] ?? 'not set'}. Flip it to "Registration open" when applications open, and "Closed" after.`
            : 'Once the term exists, keep its Status honest as the season turns.',
          status: 'info',
          path: termsPane,
          linkText: 'Open Terms',
        },
      ],
    },
    {
      heading: 'The catalog',
      steps: [
        {
          key: 'course-offerings',
          icon: '📚',
          title: 'Point courses at the new term',
          detail:
            data.coursesWithoutFutureOffering > 0
              ? `${data.coursesWithoutFutureOffering} of ${data.liveCourses} course${data.liveCourses === 1 ? '' : 's'} ha${data.coursesWithoutFutureOffering === 1 ? 's' : 've'} no offering in a future term. Open each course's Schedule & cohorts tab and add an offering.`
              : 'Every course has an offering in a future term. Review schedules and seat notes for the new season.',
          status: data.coursesWithoutFutureOffering > 0 ? 'todo' : 'done',
          path: coursesPane,
          linkText: 'Open Courses',
        },
        {
          key: 'pricing',
          icon: '💵',
          title: 'Check the pricing tiers',
          detail:
            data.tiers > 0
              ? `${data.tiers} pricing tier${data.tiers === 1 ? '' : 's'} on file. Confirm the amounts and the scholarship wording still hold for the new term.`
              : 'No pricing tiers exist yet. Add them so courses and the Pricing page have amounts to show.',
          status: data.tiers > 0 ? 'info' : 'todo',
          path: `${basePath}/structure/catalog;pricingTier`,
          linkText: 'Open Pricing Tiers',
        },
      ],
    },
    {
      heading: 'Tell people',
      steps: [
        {
          key: 'term-event',
          icon: '📅',
          title: 'Post the term-start event',
          detail:
            data.futureTermStartEvents > 0
              ? 'A future "Term start" event is on the Events page. Add an info session too if one is planned.'
              : 'Add a "Term start" event (and an info session) so the Events page carries the new season.',
          status: data.futureTermStartEvents > 0 ? 'done' : 'todo',
          intent: 'create',
          params: { type: 'event' },
          linkText: 'Add an event',
        },
        {
          key: 'announcement',
          icon: '📢',
          title: 'Announce registration',
          detail:
            'When registration opens, put up an announcement banner pointing at /courses, with an end date so it retires itself.',
          status: 'info',
          intent: 'create',
          params: { type: 'announcement' },
          linkText: 'Add an announcement',
        },
      ],
    },
    {
      heading: 'Wrap up the old season',
      steps: [
        {
          key: 'old-announcements',
          icon: '🧹',
          title: 'Clear out old notices',
          detail:
            data.expiredAnnouncements > 0
              ? `${data.expiredAnnouncements} announcement${data.expiredAnnouncements === 1 ? '' : 's'} past their end date are still switched on. Turn them off.`
              : 'No stale announcements. The Checkup tool keeps an eye on this too.',
          status: data.expiredAnnouncements > 0 ? 'todo' : 'done',
          path: `${basePath}/structure/content;announcement`,
          linkText: 'Open Announcements',
        },
        {
          key: 'home-refresh',
          icon: '🏠',
          title: 'Re-read the home page',
          detail:
            'Season wording drifts: intro lines, featured courses, the events teaser. Give the home page a fresh read for the new term.',
          status: 'info',
          intent: 'edit',
          params: { id: 'homePage', type: 'homePage' },
          linkText: 'Open the Home page',
        },
      ],
    },
  ];
}

const STATUS_BADGE: Record<Status, { tone: 'positive' | 'caution' | 'primary'; text: string }> = {
  done: { tone: 'positive', text: 'Set' },
  todo: { tone: 'caution', text: 'To do' },
  info: { tone: 'primary', text: 'Check' },
};

// A card that jumps to a doc (IntentLink) or a pane path (router). The path
// variant must use the router, not a raw <a>, or it breaks in a hash-routed
// Studio (see WelcomePane's note).
function StepCard({ step }: { step: Step }) {
  const router = useRouter();
  const badge = STATUS_BADGE[step.status];
  const inner: ReactNode = (
    <Card className="pa-setup-card" padding={3} radius={3} border style={{ height: '100%' }}>
      <Flex align="flex-start" gap={3}>
        <span aria-hidden style={{ fontSize: 20, lineHeight: '24px', flexShrink: 0 }}>
          {step.icon}
        </span>
        <Stack space={2} flex={1}>
          <Flex align="center" gap={2}>
            <Text size={1} weight="semibold">
              {step.title}
            </Text>
            <Badge tone={badge.tone} fontSize={0} padding={1}>
              {badge.text}
            </Badge>
          </Flex>
          <Text size={1} muted style={{ lineHeight: 1.5 }}>
            {step.detail}
          </Text>
          <Text size={1} style={{ color: '#33503F', fontWeight: 600 }}>
            {step.linkText} →
          </Text>
        </Stack>
      </Flex>
    </Card>
  );
  const linkStyle = { textDecoration: 'none', color: 'inherit', display: 'block' } as const;

  if (step.intent) {
    return (
      <IntentLink intent={step.intent} params={step.params} style={linkStyle}>
        {inner}
      </IntentLink>
    );
  }
  const path = step.path;
  const isHashRouted = typeof window !== 'undefined' && window.location.hash.startsWith('#/');
  const href = path ? (isHashRouted ? `${window.location.pathname}#${path}` : path) : undefined;
  return (
    <a
      href={href}
      style={linkStyle}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        if (path) router.navigateUrl({ path });
      }}
    >
      {inner}
    </a>
  );
}

export function SetupWizard() {
  const client = useClient({ apiVersion: '2025-01-01' });
  const { basePath } = useWorkspace();
  const [data, setData] = useState<SetupData | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const d = await client.fetch<SetupData>(SETUP_QUERY);
      setData(d);
    } catch {
      setData({
        nextTerm: null,
        coursesWithoutFutureOffering: 0,
        liveCourses: 0,
        tiers: 0,
        futureTermStartEvents: 0,
        expiredAnnouncements: 0,
      });
    } finally {
      setBusy(false);
    }
  }, [client]);

  useEffect(() => {
    void load();
  }, [load]);

  const sections = data ? buildSections(data, basePath) : [];
  const tracked = sections.flatMap((sec) => sec.steps).filter((st) => st.status !== 'info');
  const doneCount = tracked.filter((st) => st.status === 'done').length;

  return (
    <Box padding={4}>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .pa-setup-card { transition: transform 150ms ease, box-shadow 150ms ease; }
          a:hover .pa-setup-card { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(51, 80, 63, 0.16); }
        }
      `}</style>
      <Stack space={5} style={{ maxWidth: 680, margin: '0 auto' }}>
        <Stack space={3}>
          <ToolHeading>🍂 New term setup</ToolHeading>
          <Text size={2} muted style={{ lineHeight: 1.5 }}>
            The season rollover, in order. Each card jumps you to the right place to update it.
            Nothing changes here, you edit and publish as usual. Work top to bottom.
          </Text>
          {data && tracked.length > 0 && (
            <Text size={1} weight="semibold" muted>
              {doneCount} of {tracked.length} key items look set.
            </Text>
          )}
        </Stack>

        <Flex>
          <button
            type="button"
            onClick={() => void load()}
            disabled={busy}
            style={{
              cursor: busy ? 'default' : 'pointer',
              border: '1px solid var(--card-border-color, #ccc)',
              background: 'transparent',
              borderRadius: 6,
              padding: '6px 12px',
              font: 'inherit',
              color: 'inherit',
            }}
          >
            {busy ? 'Checking…' : 'Refresh'}
          </button>
        </Flex>

        {data === null ? (
          <Flex align="center" gap={2}>
            <Spinner muted />
            <Text size={1} muted>
              Loading…
            </Text>
          </Flex>
        ) : (
          <Stack space={5}>
            {sections.map((section) => (
              <Stack space={3} key={section.heading}>
                <Text
                  size={1}
                  weight="semibold"
                  muted
                  style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
                >
                  {section.heading}
                </Text>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: 12,
                  }}
                >
                  {section.steps.map((step) => (
                    <StepCard key={step.key} step={step} />
                  ))}
                </div>
              </Stack>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
