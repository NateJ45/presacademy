// =============================================================================
// production-guard.mjs - the production second factor for scripts that build
// their own Sanity client instead of importing scripts/lib/sanity-lib.mjs
// =============================================================================
// WHY (2026-10-13, starter PORTS.md card 86, step 3)
// sanity-lib.mjs refuses `--apply` on the `production` dataset unless the same
// command sets NCS_PRODUCTION_WRITE=yes. A handful of older scripts here make
// their own client (or call the HTTP API with fetch), so they never import
// sanity-lib and never got that check. This gives them the same one, with the
// same wording, in one call:
//
//   import { guardProductionWrite } from './lib/production-guard.mjs';
//   guardProductionWrite({ apply: APPLY, dataset });   // before any request
//
// The rule is identical to sanity-lib's productionWriteRefusal (kept as a
// separate copy because importing sanity-lib runs its own client and token
// checks at import, which these scripts do differently):
//   - a dry run (no --apply) is always allowed: it writes nothing;
//   - --apply on a dataset other than `production` is allowed;
//   - --apply on `production` needs NCS_PRODUCTION_WRITE=yes, read from
//     process.env DIRECTLY, never from a merged .env, so it cannot be set once
//     in a file and forgotten.
// Tests: scripts/lib/production-guard.test.mjs (fake project, fake token,
// https://example.invalid; never production).
// =============================================================================

/**
 * Pure: why this run may not write, or null when it may.
 * `processEnv` is always process.env itself in real use.
 */
export function productionWriteRefusal({ apply, dataset, processEnv }) {
  if (!apply || dataset !== 'production') return null;
  if (processEnv.NCS_PRODUCTION_WRITE === 'yes') return null;
  return [
    'Refusing to write: --apply targets the production dataset, and --apply alone is not enough.',
    'Set NCS_PRODUCTION_WRITE=yes in the same command, after a backup and a dry run',
    '(bash: NCS_PRODUCTION_WRITE=yes node <script> --apply). A delegated agent may set it only under the write protocol (backup, dry run, apply, verify).',
    'Run without --apply to see the plan. PORTS.md card 86.',
  ].join('\n');
}

/** Exit 2, before any request, when this run may not write. */
export function guardProductionWrite({ apply, dataset }) {
  const refusal = productionWriteRefusal({ apply, dataset, processEnv: process.env });
  if (refusal) {
    console.error(refusal);
    process.exit(2);
  }
}
