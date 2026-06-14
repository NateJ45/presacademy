// Safe to edit by hand.
// Help banner shown at the top of every page/document form (wired via the root
// form input in StudioFormInput). It names what the editor is editing and links
// straight to that page on the LIVE site, plus the publish-to-live reminder.
//
// This is the "map Studio to the live site" aid. On a static site we can't run
// Sanity's click-to-edit Presentation overlay (that needs server-side rendering),
// so this gives faculty a one-click "show me where this appears" instead.
// Returns null for documents with no public page (e.g. Site Settings).

import { Card, Stack, Flex, Text, Button } from '@sanity/ui';
import { LaunchIcon } from '@sanity/icons';
// pathForDoc maps a doc type (+ slug) to its site path; LIVE_SITE_URL is the
// production base. Imported from the config — a safe ES-module cycle because
// both are used only at render time, long after the modules finish loading.
import { pathForDoc, LIVE_SITE_URL } from '../sanity.config';

export function PageHelpBanner({
  schemaType,
  value,
}: {
  schemaType: { name: string; title?: string };
  value: unknown;
}) {
  const path = pathForDoc(schemaType.name, value);
  if (path === null) return null; // No public page (Site Settings, etc.) — no banner.
  const url = `${LIVE_SITE_URL}${path}`;
  const title = schemaType.title || schemaType.name;
  return (
    <Card tone="primary" padding={3} radius={3} shadow={1}>
      <Flex align="center" justify="space-between" gap={3} wrap="wrap">
        <Stack space={2} style={{ flex: 1, minWidth: 220 }}>
          <Text size={1} weight="semibold">
            You are editing: {title}
          </Text>
          <Text size={1} muted>
            Your changes appear on the live site a few minutes after you press Publish.
          </Text>
        </Stack>
        <Button
          as="a"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          mode="ghost"
          tone="primary"
          fontSize={1}
          paddingX={3}
          paddingY={2}
          text="View on the live site"
          iconRight={LaunchIcon}
        />
      </Flex>
    </Card>
  );
}

export default PageHelpBanner;
