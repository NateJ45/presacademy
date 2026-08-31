import React, { useCallback, useEffect, useState } from 'react';
import { Box, Button, Card, Dialog, Flex, Stack, Text } from '@sanity/ui';
import { ToolHeading } from './ToolHeading';

// =============================================================================
// StudioTour — the Studio's first-visit welcome
// =============================================================================
// (Ported from the WCP site's StudioTour, 2026-08-31.) A stepped dialog that
// greets an editor the FIRST time this browser opens the Studio, then never
// again (localStorage, device-local). It rides StudioLayout, so it needs no
// Sanity feature beyond the custom layout component the Studio already has.
//
// Re-open path: the Welcome pane fires the OPEN_EVENT below. Nothing here
// mutates content; Escape / "Skip" close it for good. Bump SEEN_KEY when the
// steps change enough that returning editors should see them again. Storage
// reads are try/caught so a blocked localStorage can never take the Studio
// down with it.
// =============================================================================

const SEEN_KEY = 'presacademy-studio-tour-v1';

/** The Welcome pane dispatches this to replay the tour on demand. */
export const OPEN_EVENT = 'presacademy-studio-tour-open';

interface Step {
  emoji: string;
  title: string;
  body: string;
}

const STEPS: Step[] = [
  {
    emoji: '👋',
    title: 'Welcome to the Studio',
    body: 'This is where the website gets edited — words, photos, pages, courses, all of it. Nothing you type is visible to anyone until you press the green Publish button, so it is safe to look around.',
  },
  {
    emoji: '🖱️',
    title: 'Edit pages by clicking the page',
    body: 'Open Presentation in the top bar to see the site itself. Click any words on the page and the matching text box opens beside it. The page list on the left flips between pages like a site builder — an amber dot means unpublished edits, and ＋ New page starts a fresh one.',
  },
  {
    emoji: '➕',
    title: 'Start from a layout',
    body: 'The ＋ button in the top-left makes anything new, and pages, courses, and events offer pre-filled layouts so you edit real content instead of composing from a blank canvas. Next to it, the 🔍 search finds any document by name or by the words on it.',
  },
  {
    emoji: '🖼️',
    title: 'Every photo, one place',
    body: 'Media in the top bar is the photo library: browse, search, edit a caption, and see which pages use each picture. Every image picker can also browse it, so you never upload the same photo twice.',
  },
  {
    emoji: '🩺',
    title: 'The tools do the remembering',
    body: 'In the top bar: Checkup answers "does anything need attention?" — stale terms, missing basics, edits waiting to publish. New term setup walks the season rollover card by card. Site stats shows how the site is doing.',
  },
  {
    emoji: '❔',
    title: 'Help is built in',
    body: 'How This Works (near the top of the left menu) has a plain-language walkthrough for every job. When you are unsure, start there.',
  },
  {
    emoji: '🛟',
    title: 'You cannot break it',
    body: 'Edits stay drafts until you Publish. Archived things can come back. Ctrl+Z undoes section moves. And every night the whole site is backed up automatically. Go ahead and try things.',
  },
];

export function StudioTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!localStorage.getItem(SEEN_KEY)) {
        // A short delay so the Studio paints first and the dialog reads as a
        // greeting, not a roadblock.
        const t = setTimeout(() => setOpen(true), 900);
        return () => clearTimeout(t);
      }
    } catch {
      /* no storage → no tour, and no crash */
    }
    return undefined;
  }, []);

  useEffect(() => {
    const replay = () => {
      setStep(0);
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, replay);
    return () => window.removeEventListener(OPEN_EVENT, replay);
  }, []);

  const dismiss = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {
      /* fine — it will greet again next time */
    }
  }, []);

  if (!open) return null;

  const current = STEPS[Math.min(step, STEPS.length - 1)];
  const last = step >= STEPS.length - 1;

  return (
    <Dialog
      id="presacademy-studio-tour"
      header="A quick hello"
      width={0}
      onClose={dismiss}
      footer={
        <Box padding={3}>
          <Flex gap={2} justify="space-between" align="center">
            <Button mode="bleed" text="Skip" onClick={dismiss} />
            <Flex gap={2} align="center">
              {/* Step dots — decorative; the count is in the button label. */}
              <Text size={1} muted aria-hidden>
                {STEPS.map((_, i) => (i === step ? '●' : '○')).join(' ')}
              </Text>
              {step > 0 && (
                <Button mode="ghost" text="Back" onClick={() => setStep((s) => s - 1)} />
              )}
              <Button
                tone="primary"
                text={last ? 'Start editing' : 'Next'}
                onClick={() => (last ? dismiss() : setStep((s) => s + 1))}
              />
            </Flex>
          </Flex>
        </Box>
      }
    >
      <Box padding={4}>
        <Stack space={4}>
          <ToolHeading>
            {current.emoji} {current.title}
          </ToolHeading>
          <Card tone="transparent" radius={2}>
            <Text size={2} style={{ lineHeight: 1.6 }}>
              {current.body}
            </Text>
          </Card>
        </Stack>
      </Box>
    </Dialog>
  );
}
