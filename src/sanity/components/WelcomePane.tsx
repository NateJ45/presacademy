import { useEffect, useState, type ComponentProps, type ReactNode } from 'react';
import { useClient, useWorkspace } from 'sanity';
import { IntentLink, useRouter } from 'sanity/router';
import { ToolHeading } from './ToolHeading';
import { OPEN_EVENT as TOUR_OPEN_EVENT } from './StudioTour';
import { Box, Button, Card, Stack, Text, Flex, Spinner } from '@sanity/ui';

// =============================================================================
// WelcomePane — the Studio landing screen
// =============================================================================
// The first thing an editor sees: a warm hello, a grid of TASK cards that
// deep-link straight to the thing they came to do ("edit a page", "add a
// course", "post an event"), and a live "recently edited" list to resume work.
// Look: rounded cards with soft Geneva Green icon chips and a reduced-motion-
// safe hover lift, matching the school's Fraunces/green Studio chrome.
// =============================================================================

interface RecentDoc {
  _id: string;
  _type: string;
  _updatedAt: string;
  title?: string;
  name?: string;
  question?: string;
  quote?: string;
  message?: string;
}

// Friendly labels for every editable type (mirrors structure.ts naming).
const TYPE_LABELS: Record<string, string> = {
  siteSettings: 'Site Settings',
  homePage: 'Home page',
  aboutPage: 'About page',
  faqPage: 'FAQ page',
  contactPage: 'Contact page',
  eventsPage: 'Events page',
  notFoundPage: '404 page',
  privacyPage: 'Privacy page',
  accessibilityPage: 'Accessibility page',
  coursesPage: 'Courses page',
  facultyPage: 'Faculty page',
  pricingPage: 'Pricing page',
  getStartedPage: 'Get Started page',
  forYouPage: 'For You page',
  resourcesPage: 'Resources page',
  page: 'Custom page',
  course: 'Course',
  facultyMember: 'Faculty member',
  term: 'Term',
  teachingArea: 'Teaching area',
  pricingTier: 'Pricing tier',
  testimonial: 'Testimonial',
  faqItem: 'FAQ',
  faqCategory: 'FAQ category',
  event: 'Event',
  announcement: 'Announcement',
  form: 'Form',
};

// Everything a human edits. Used by the recently-edited query.
const RECENT_TYPES = Object.keys(TYPE_LABELS);

const RECENT_QUERY = `*[
  _type in $types && !(_id in path("drafts.**")) && archived != true
] | order(_updatedAt desc)[0...6]{ _id, _type, _updatedAt, title, name, question, quote, message }`;

function docLabel(doc: RecentDoc): string {
  return doc.title || doc.name || doc.question || doc.quote || doc.message || 'Untitled';
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

// Soft icon-chip tints. The tint sits behind a decorative emoji only; label
// text stays the theme's own color so both light and dark schemes keep AA.
const CHIPS = {
  green: { background: '#e4ece6', color: '#33503F' },
  brass: { background: '#f3ead9', color: '#7a5a2b' },
  oxblood: { background: '#f2e2e0', color: '#7c2f28' },
  slate: { background: '#e7eaee', color: '#3d4852' },
} as const;

function Chip({ tint, children }: { tint: keyof typeof CHIPS; children: ReactNode }) {
  return (
    <span
      aria-hidden
      style={{
        ...CHIPS[tint],
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 34,
        height: 34,
        borderRadius: 10,
        fontSize: 17,
        flexShrink: 0,
      }}
    >
      {children}
    </span>
  );
}

// One task card: icon chip + label + hint, wrapping either an IntentLink
// (document edit/create) or a router-path link (tool / structure pane).
//
// The path variant goes through the Studio router, not a raw <a href>: in a
// hash-routed Studio a plain anchor to "/structure/..." leaves the Studio.
// Clicks call router.navigateUrl (correct in hash AND browser modes); the href
// is a best-effort real URL so middle-click / open-in-new-tab still works.
function TaskCard(props: {
  icon: string;
  tint: keyof typeof CHIPS;
  label: string;
  hint: string;
  intent?: ComponentProps<typeof IntentLink>['intent'];
  params?: Record<string, string>;
  /** Router path incl. workspace basePath, e.g. `${basePath}/media`. */
  path?: string;
}) {
  const { icon, tint, label, hint, intent, params, path } = props;
  const router = useRouter();
  const inner = (
    <Card className="pa-task-card" padding={3} radius={3} border style={{ height: '100%' }}>
      <Flex align="center" gap={3}>
        <Chip tint={tint}>{icon}</Chip>
        <Stack space={2}>
          <Text size={1} weight="semibold">
            {label}
          </Text>
          <Text size={1} muted>
            {hint}
          </Text>
        </Stack>
      </Flex>
    </Card>
  );
  const linkStyle = { textDecoration: 'none', color: 'inherit', display: 'block' } as const;
  if (intent) {
    return (
      <IntentLink intent={intent} params={params} style={linkStyle}>
        {inner}
      </IntentLink>
    );
  }
  const isHashRouted = typeof window !== 'undefined' && window.location.hash.startsWith('#/');
  const href = isHashRouted ? `${window.location.pathname}#${path}` : path;
  return (
    <a
      href={href}
      style={linkStyle}
      onClick={(event) => {
        // Let modified clicks (new tab etc.) fall through to the href.
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
        event.preventDefault();
        if (path) router.navigateUrl({ path });
      }}
    >
      {inner}
    </a>
  );
}

export function WelcomePane() {
  const client = useClient({ apiVersion: '2025-01-01' });
  const { basePath } = useWorkspace();
  const [recent, setRecent] = useState<RecentDoc[] | null>(null);

  useEffect(() => {
    let alive = true;
    client
      .fetch<RecentDoc[]>(RECENT_QUERY, { types: RECENT_TYPES })
      .then((docs) => alive && setRecent(docs))
      .catch(() => alive && setRecent([]));
    return () => {
      alive = false;
    };
  }, [client]);

  return (
    <Box padding={4}>
      {/* Hover lift, gated for reduced motion. */}
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .pa-task-card { transition: transform 150ms ease, box-shadow 150ms ease; }
          a:hover .pa-task-card { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(51, 80, 63, 0.16); }
        }
      `}</style>
      <Stack space={5} style={{ maxWidth: 680, margin: '0 auto' }}>
        <Stack space={3}>
          <ToolHeading>👋 Welcome to The Presbyterian Academy Studio</ToolHeading>
          <Text size={2} muted style={{ lineHeight: 1.5 }}>
            This is where you edit the website. Nothing goes live until you click{' '}
            <strong>Publish</strong>, so click around and explore. New here? Open{' '}
            <strong>How This Works</strong> in the left menu for step-by-step walkthroughs.
          </Text>
          <Box>
            {/* Replays the first-visit tour (StudioTour.tsx listens). */}
            <Button
              mode="bleed"
              padding={2}
              text="Show the welcome tour again"
              onClick={() => window.dispatchEvent(new CustomEvent(TOUR_OPEN_EVENT))}
            />
          </Box>
        </Stack>

        <Stack space={3}>
          <Text
            size={1}
            weight="semibold"
            muted
            style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
          >
            What do you want to do?
          </Text>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 12,
            }}
          >
            <TaskCard
              icon="✏️"
              tint="green"
              label="Edit a page"
              hint="Words and photos on any page"
              path={`${basePath}/structure/pages`}
            />
            <TaskCard
              icon="📚"
              tint="green"
              label="Add or edit a course"
              hint="The catalog, cohort by cohort"
              path={`${basePath}/structure/catalog;course`}
            />
            <TaskCard
              icon="📅"
              tint="brass"
              label="Add an event"
              hint="Info session, lecture, term start"
              intent="create"
              params={{ type: 'event' }}
            />
            <TaskCard
              icon="💵"
              tint="brass"
              label="Update pricing"
              hint="Tiers and scholarship wording"
              path={`${basePath}/structure/catalog;pricingTier`}
            />
            <TaskCard
              icon="💬"
              tint="oxblood"
              label="Add a testimonial"
              hint="A short quote from a student"
              intent="create"
              params={{ type: 'testimonial' }}
            />
            <TaskCard
              icon="📷"
              tint="slate"
              label="Swap or manage photos"
              hint="The Media library"
              path={`${basePath}/media`}
            />
            <TaskCard
              icon="📖"
              tint="slate"
              label="Open the guides"
              hint="Step-by-step walkthroughs"
              path={`${basePath}/structure/how-this-works`}
            />
          </div>
        </Stack>

        <Stack space={3}>
          <Text
            size={1}
            weight="semibold"
            muted
            style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
          >
            Recently edited
          </Text>
          {recent === null ? (
            <Flex align="center" gap={2}>
              <Spinner muted />
              <Text size={1} muted>
                Loading…
              </Text>
            </Flex>
          ) : recent.length === 0 ? (
            <Text size={1} muted>
              Nothing published yet.
            </Text>
          ) : (
            <Stack space={2}>
              {recent.map((doc) => (
                <IntentLink
                  key={doc._id}
                  intent="edit"
                  params={{ id: doc._id, type: doc._type }}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <Card className="pa-task-card" padding={3} radius={3} border>
                    <Flex align="center" justify="space-between" gap={3}>
                      <Stack space={1}>
                        <Text size={1} weight="medium">
                          {docLabel(doc)}
                        </Text>
                        <Text size={0} muted>
                          {TYPE_LABELS[doc._type] ?? doc._type}
                        </Text>
                      </Stack>
                      <Text size={0} muted>
                        {timeAgo(doc._updatedAt)}
                      </Text>
                    </Flex>
                  </Card>
                </IntentLink>
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
