import React, { type ReactNode } from 'react';
import { Flex, Heading } from '@sanity/ui';
import churchMark from './church-mark.png';

// =============================================================================
// ToolHeading — the ONE header for the custom Studio tools
// =============================================================================
// (Ported from the WCP site's ToolHeading, 2026-08-31.) Every custom tool
// (Welcome, Checkup, New term setup, Site stats) opens with the same brand
// moment: the mark on its paper chip beside a display-serif heading — the
// same chip StudioLogo draws in the header, so the tools read as one family.
// One component, so a future tool gets the look for free. Decorative (alt="").
// =============================================================================

export function ToolHeading({ children }: { children: ReactNode }) {
  return (
    <Flex align="center" gap={3}>
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 40,
          height: 40,
          borderRadius: 9,
          background: '#FBF8F2',
          border: '1px solid rgba(54, 48, 42, 0.12)',
          flex: 'none',
        }}
      >
        <img src={churchMark} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
      </span>
      <Heading size={3}>{children}</Heading>
    </Flex>
  );
}
