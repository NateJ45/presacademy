import { Box, Card, Label, Stack, Text } from '@sanity/ui';
import { useFormValue, type StringInputProps } from 'sanity';
import { pathForDoc } from '../urls';

// =============================================================================
// SeoPanelInput — the live "how this looks" pair at the top of Search & sharing
// =============================================================================
// Mounted as the custom input on the FIRST field of the Search & sharing group
// (seoTitle, see ../schemaTypes/seo.ts). It draws two pictures above the
// ordinary text box, then hands the box itself back to Sanity untouched:
//
//   1. a Google search result, as the page would appear when someone finds it
//   2. a social share card, as it appears pasted into Facebook or iMessage
//
// Both update on every keystroke, so an editor can see the sentence get cut
// off instead of counting characters.
//
// This is the same picture the read-only "Search preview" TAB draws
// (./SeoPreviewPane.tsx). The two differ in ONE important way: this one lives
// inside the form, so useFormValue is safe here. A document VIEW has no form
// around it, and calling useFormValue there throws and freezes the panel — the
// pane reads `document.displayed` instead. Keep that split.
//
// No new dependencies: @sanity/ui primitives and inline styles only.
// =============================================================================

const DOMAIN = 'presbyterianacademy.org';
const GOOGLE_TITLE_MAX = 60;
const GOOGLE_DESC_MAX = 160;

function clamp(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

export function SeoPanelInput(props: StringInputProps) {
  // The whole document, draft-merged and live as the editor types.
  const doc = (useFormValue([]) ?? {}) as Record<string, unknown>;

  const docType = str(doc._type);
  const title = str(doc.title) || str(doc.name);
  const seoTitle = str(doc.seoTitle);
  const seoDescription = str(doc.seoDescription);
  // Courses and events fall back to their summary, the way the site does.
  const summary = str(doc.summary);
  const hidden = doc.hideFromSearch === true;

  const displayTitle = seoTitle || title || 'Untitled page';
  const displayDesc =
    seoDescription ||
    summary ||
    'No description set. Add one so search and social look their best.';
  const path = docType ? (pathForDoc(docType, doc) ?? '') : '';
  const prettyUrl = `${DOMAIN}${path === '/' ? '' : path}`;

  return (
    <Stack space={4}>
      {hidden && (
        <Card padding={3} radius={2} tone="caution" border>
          <Text size={1}>
            This page is hidden from search, so Google will not list it at all. The pictures below
            show what it would look like if you turned that off.
          </Text>
        </Card>
      )}

      {/* Google search result */}
      <Stack space={3}>
        <Label size={1} muted>
          In Google
        </Label>
        <Card padding={4} radius={2} border>
          <Stack space={2}>
            <Text size={1} style={{ color: '#5f6368' }}>
              {prettyUrl}
            </Text>
            <Text size={3} weight="medium" style={{ color: '#1a0dab' }}>
              {clamp(displayTitle, GOOGLE_TITLE_MAX)}
            </Text>
            <Text size={1} style={{ color: '#4d5156', lineHeight: 1.5 }}>
              {clamp(displayDesc, GOOGLE_DESC_MAX)}
            </Text>
          </Stack>
        </Card>
      </Stack>

      {/* Social share card */}
      <Stack space={3}>
        <Label size={1} muted>
          Shared in a message
        </Label>
        <Card radius={2} overflow="hidden" border>
          <Box
            style={{
              height: 140,
              background: 'linear-gradient(135deg,#2A4233,#3E7C66)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text size={1} style={{ color: 'rgba(255,255,255,0.85)' }}>
              Share image
            </Text>
          </Box>
          <Card padding={3} tone="transparent" style={{ background: '#f2f3f5' }}>
            <Stack space={2}>
              <Text size={0} muted style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {DOMAIN}
              </Text>
              <Text size={2} weight="semibold">
                {clamp(displayTitle, 70)}
              </Text>
              <Text size={1} muted>
                {clamp(displayDesc, 120)}
              </Text>
            </Stack>
          </Card>
        </Card>
      </Stack>

      {/* The ordinary SEO title box, drawn by Sanity exactly as it always was. */}
      {props.renderDefault(props)}
    </Stack>
  );
}
