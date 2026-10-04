---
paths:
  - '.claude/settings.json'
  - 'docs/RESTORE-DRILL.md'
  - 'docs/claude/family-conventions.md'
  - 'scripts/free-dist.mjs'
  - 'scripts/generate-llms-full.mjs'
  - 'scripts/lib/loadEnv.mjs'
  - 'scripts/lib/sanity-lib.mjs'
  - 'scripts/lib/site-identity.mjs'
  - 'scripts/propose-drift.mjs'
  - 'scripts/public-data-audit.mjs'
  - 'scripts/publish-due.mjs'
  - 'scripts/restore-dataset.mjs'
  - 'scripts/sync-check.mjs'
  - 'scripts/with-workerd.mjs'
  - 'src/components/preview/overlay/styles.ts'
  - 'src/components/preview/overlay/useDraftDocument.ts'
  - 'src/components/preview/overlay/usePopover.ts'
  - 'src/lib/contrast.ts'
  - 'src/lib/heading-accent.ts'
  - 'src/lib/inline-rich-write.test.ts'
  - 'src/lib/inline-rich-write.ts'
  - 'src/lib/inline-rich.ts'
  - 'src/lib/page-checks.test.ts'
  - 'src/lib/page-checks.ts'
  - 'src/lib/phone.ts'
  - 'src/lib/portable-text-headings.ts'
  - 'src/lib/preview-live-draft.test.ts'
  - 'src/lib/preview-live-draft.ts'
  - 'src/lib/preview-morph.test.ts'
  - 'src/lib/preview-morph.ts'
  - 'src/lib/preview-navigation.test.ts'
  - 'src/lib/preview-navigation.ts'
  - 'src/lib/preview-refresh.test.ts'
  - 'src/lib/preview-refresh.ts'
  - 'src/lib/preview-stega.test.ts'
  - 'src/lib/preview-stega.ts'
  - 'src/lib/preview-text-diff.test.ts'
  - 'src/lib/preview-text-diff.ts'
  - 'src/lib/preview-text-nodes.test.ts'
  - 'src/lib/preview-text-nodes.ts'
  - 'src/lib/reading-time.ts'
  - 'src/lib/redirects.test.ts'
  - 'src/lib/redirects.ts'
  - 'src/lib/sanity-path.test.ts'
  - 'src/lib/sanity-path.ts'
  - 'src/lib/scriptAccent.ts'
  - 'src/lib/slugify.test.ts'
  - 'src/lib/slugify.ts'
  - 'src/lib/subscribe.ts'
  - 'src/lib/undoRedo.test.ts'
  - 'src/lib/utils.test.ts'
  - 'src/lib/utils.ts'
  - 'src/sanity/actions/checkPage.tsx'
  - 'src/sanity/actions/saveSectionPreset.tsx'
  - 'src/sanity/components/UndoRedo.tsx'
  - 'src/sanity/components/shareDraftLink.tsx'
  - 'src/sanity/components/slugRedirect.tsx'
  - 'src/sanity/pageOps.ts'
  - 'src/sanity/schemaTypes/_publishAt.ts'
  - 'src/sanity/undoRedo.ts'
---

# Shared-file sync (the site family)

The frontmatter paths are every file `node scripts/sync-check.mjs` lists as PORTABLE-marked. This rule loads when you touch one: do not edit it here, improve it in the starter first.

This repo is a member of the cross-repo sync system whose **library of record** is
`ncs-astro-sanity-starter`. Its `PORTS.md` is the registry: one dated card per portable
improvement (what it is, why it exists, how to install it) plus a matrix of which repo has
which. Files the starter owns carry a first-line marker:

```
// PORTABLE: canonical copy - ncs-astro-sanity-starter is the library of record for this file
```

`node scripts/sync-check.mjs` lists every marked file (62 as of 2026-10-03; 42 when this rule was first written 2026-08-28). Among them: `scripts/free-dist.mjs`, `scripts/with-workerd.mjs`,
`scripts/lib/sanity-lib.mjs`, `src/lib/contrast.ts`, `scripts/sync-check.mjs`,
`src/lib/page-checks.ts`, `src/sanity/pageOps.ts`, and the safe-rename trio
`src/lib/redirects.ts`, `src/lib/redirects.test.ts`,
`src/sanity/components/slugRedirect.tsx`; and, since 2026-09-29 (card 60), the Windows
`astro dev` fix `src/lib/sanity-dedupe-alias.ts` + `.test.ts` (wired into
`astro.config.mjs` as `fixSanityDedupeAlias()`; never delete it, see stack-and-config.md).
Since 2026-10-03 (card 71) two Claude setup files are marked too: `.claude/settings.json` (JSON, marker is the top-level `"_portable"` key; deny rules for `git reset --hard` and force pushes) and `docs/claude/family-conventions.md` (the code conventions and working-with-Claude text, imported from CLAUDE.md with `@docs/claude/family-conventions.md`). Edit neither here. `.claude/settings.local.json` stays git-ignored and personal.
`scripts/lib/loadEnv.mjs` ships alongside sanity-lib as its one non-npm dependency.
Since 2026-10-03 (card 81) `scripts/generate-llms-full.mjs` imports `scripts/lib/site-identity.mjs` (also marked): the site name and URL for `public/llms-full.txt` come from env (`SITE_NAME`, `PUBLIC_SITE_URL`), then `brand/brand.config.json` (`name`, `domain`), then the old `Studio Starter` / `example.com` placeholders. Never copy the script without the lib. The starter's `site-identity.test.mjs` is not carried here (no `test:scripts` script).

**The in-canvas control layer joined them 2026-08-28** (PORTS.md cards 28 and 28b):
`src/lib/sanity-path.ts`, `src/lib/inline-rich.ts`, `src/lib/inline-rich-write.ts`,
`src/lib/heading-accent.ts` (+ the two canonical `.test.ts`), and
`src/components/preview/overlay/{usePopover,useDraftDocument,styles}.ts`. Two seams keep
them shareable, and BOTH are edited here rather than there:

- `readSectionPath(path, arrayFields)` TAKES this schema's page-builder array names.
  The list is `SECTION_ARRAY_FIELDS` in `src/lib/section-fields.ts`.
- `src/components/preview/overlay/tool-theme.ts` holds the six palette values the
  canonical `styles.ts` draws every control with. A rebrand edits that file alone.

`src/components/preview/overlay/{index,tool-theme,HeadingAccentPicker,SurfaceChips,
TextPopover,useInstantText,timing}.ts(x)` and `src/lib/section-fields.ts` stay per-repo
on purpose: they name this schema's sections, fields and labels.

`src/lib/site-stats.ts` is deliberately **unmarked for now**: it is repo-agnostic and the
starter should adopt it, but the starter has no copy yet. Add the marker to both in the
sync session that ports it.

Check for drift with:

```
NCS_STARTER_DIR=<path-to-starter> node scripts/sync-check.mjs
```

It diffs every marked file against the starter's copy (line endings normalized, everything
else byte-exact) and exits 1 on drift. **A marked file is not edited here.** Improve it in
the starter with a PORTS.md card in the same commit, then pull it back. If a local
adaptation is genuinely required, drop the marker and record the fork on that card.

`scripts/page-parity.mjs` is deliberately **unmarked**: it is the origin of the starter's
harness, and both copies accrue site-specific normalizer rules, so it is a ported pattern
rather than a canonical file.
