import { Card, Stack, Text, Box, Flex, Label } from '@sanity/ui';
import { pathForDoc } from '../urls';

// =============================================================================
// SeoPreviewPane — a "see how it looks when searched/shared" document view
// =============================================================================
// A read-only preview shown as an extra tab on page-like documents and courses.
// It reads the doc's live SEO fields and renders (1) a Google search result and
// (2) a social share card, so an editor can see the title/description before
// publishing. Wired in via `defaultDocumentNode` in sanity.config.ts.
//
// IMPORTANT (learned the hard way on a sister project): a custom document-view
// pane must read its values from the `document.displayed` PROP that Sanity
// passes to every view component (draft-merged, updates live as you type),
// NEVER from the useFormValue() hook. useFormValue requires a FormValueProvider
// that is absent when a view is mounted inside the Presentation tool; calling
// it there throws and the error freezes the whole panel. The prop has no such
// dependency, so this works everywhere.
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

interface SeoPreviewPaneProps {
  document?: { displayed?: Record<string, unknown> };
}

export function SeoPreviewPane(props: SeoPreviewPaneProps) {
  // The live, draft-merged document the editor is showing.
  const doc = props.document?.displayed ?? {};
  const docType = str(doc._type);
  const title = str(doc.title) || str(doc.name);
  const seoTitle = str(doc.seoTitle);
  const seoDescription = str(doc.seoDescription);
  // Courses/events fall back to their summary the way the site itself does.
  const summary = str(doc.summary);

  const displayTitle = seoTitle || title || 'Untitled page';
  const displayDesc =
    seoDescription || summary || 'No description set. Add one so search + social look their best.';
  const path = docType ? (pathForDoc(docType, doc) ?? '') : '';
  const prettyUrl = `${DOMAIN}${path === '/' ? '' : path}`;

  return (
    <Box padding={4}>
      <Stack space={5} style={{ maxWidth: 640, margin: '0 auto' }}>
        <Card padding={3} radius={2} tone="primary" border>
          <Text size={1} muted>
            This is a preview of how this page looks in Google and when shared on social media. It
            updates as you edit the SEO fields. Nothing here is editable.
          </Text>
        </Card>

        {/* Google search result */}
        <Stack space={3}>
          <Label size={1} muted>
            Google result
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
            Social share card (Facebook, iMessage, Slack)
          </Label>
          <Card radius={2} overflow="hidden" border>
            <Box
              style={{
                height: 180,
                background: 'linear-gradient(135deg,#2A4233,#3E7C66)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text size={2} style={{ color: 'rgba(255,255,255,0.85)' }}>
                Share image
              </Text>
            </Box>
            <Card padding={3} tone="transparent" style={{ background: '#f2f3f5' }}>
              <Stack space={2}>
                <Text
                  size={0}
                  muted
                  style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
                >
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

        <Flex gap={3}>
          <Card padding={3} radius={2} tone={seoTitle ? 'positive' : 'caution'} flex={1} border>
            <Text size={1}>
              {seoTitle
                ? '✓ Custom SEO title set'
                : 'Using the page title (add a custom SEO title to fine-tune)'}
            </Text>
          </Card>
          <Card
            padding={3}
            radius={2}
            tone={seoDescription || summary ? 'positive' : 'caution'}
            flex={1}
            border
          >
            <Text size={1}>
              {seoDescription || summary ? '✓ Description set' : 'No description yet. Add one'}
            </Text>
          </Card>
        </Flex>
      </Stack>
    </Box>
  );
}
