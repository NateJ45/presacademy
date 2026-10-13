// =============================================================================
// migrate-privacy-forms.mjs: tell visitors where form messages now go
// (2026-10-13, the move from Web3Forms + hCaptcha to /api/contact/, card 45)
// =============================================================================
//   node scripts/migrate-privacy-forms.mjs            (dry run: prints the plan)
//   node scripts/migrate-privacy-forms.mjs --apply    (writes to the dataset)
//
// The live privacy page does NOT render the code fallback in
// src/components/blocks/LegalBodyBlock.astro. Its words are stored in Sanity,
// in privacyPage.flexibleSections[_key == "privacyBody"].body, where no code
// change or build can reach them (vault gotcha
// turning-analytics-on-falsifies-stored-privacy-copy). So this script adds ONE
// paragraph to that stored body, straight after the "When you email us or send
// a message through this site..." paragraph (_key b14):
//
//   "When you send a message through a form on this site, it is stored in the
//    Academy's own database, hosted by Cloudflare, ..."
//
// The same sentence is in the code fallback and in scripts/seed-editability.mjs,
// so a reseed does not quietly drop it again.
//
// SAFE BY CONSTRUCTION
//   - Dry run by default; --apply writes. A dry run works with only the READ
//     token in .env (it never writes); --apply needs SANITY_API_WRITE_TOKEN.
//   - Idempotent: the new block has a fixed _key (privacyForms). If it already
//     exists with this text, nothing happens; if it exists with different text
//     (an editor reworded it), it is LEFT ALONE and reported, not overwritten.
//   - Touches the published document and, when one exists, its draft, so an
//     editor's pending draft does not reintroduce the old body on publish.
//   - Nothing is removed, so the revert is deleting the one block in Studio.
//
// Run it AFTER the code PR merges (so the form really works the way the page
// says), then /rebuild: the page is prerendered, and the stored edit reaches
// visitors only after a rebuild. Verify by fetching /privacy/ on the live site.
// =============================================================================
import { loadEnv } from './lib/loadEnv.mjs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APPLYING = process.argv.includes('--apply');

// sanity-lib (PORTABLE, not edited here) insists on a write token even to
// read. A dry run only reads, so lend it the read token for that case.
if (!APPLYING) {
  const env = loadEnv(ROOT);
  if (!env.SANITY_API_WRITE_TOKEN && !env.SANITY_AUTH_TOKEN && env.SANITY_API_READ_TOKEN) {
    process.env.SANITY_AUTH_TOKEN = env.SANITY_API_READ_TOKEN;
  }
}

const { client, apply, done } = await import('./lib/sanity-lib.mjs');
const raw = client.withConfig({ perspective: 'raw' });

const SECTION_KEY = 'privacyBody';
const ANCHOR_KEY = 'b14';
const BLOCK_KEY = 'privacyForms';
const TEXT =
  "When you send a message through a form on this site, it is stored in the Academy's own database, hosted by Cloudflare, and emailed to the Academy so we can reply. Each form is checked for spam by Cloudflare Turnstile, which looks at technical details from your browser to tell a person from an automated program. Cloudflare does not use that information for advertising.";

const newBlock = {
  _key: BLOCK_KEY,
  _type: 'block',
  style: 'normal',
  markDefs: [],
  children: [{ _key: `${BLOCK_KEY}s`, _type: 'span', marks: [], text: TEXT }],
};

const plainText = (b) => (b?.children ?? []).map((c) => c.text ?? '').join('');

const docs = await raw.fetch(
  `*[_id in ["privacyPage", "drafts.privacyPage"]]{ _id, _rev, flexibleSections }`,
);
if (!docs.length) {
  console.log('privacyPage: no document in this dataset. Nothing to do.');
  done(0);
  process.exit(0);
}

let changes = 0;
for (const doc of docs) {
  const section = (doc.flexibleSections ?? []).find((s) => s._key === SECTION_KEY);
  if (!section) {
    console.log(`${doc._id}: no "${SECTION_KEY}" section; the code fallback renders. Skipped.`);
    continue;
  }
  const body = section.body ?? [];
  const existing = body.find((b) => b._key === BLOCK_KEY);
  if (existing) {
    if (plainText(existing) === TEXT) {
      console.log(`${doc._id}: form paragraph already present. Nothing to do.`);
    } else {
      console.log(
        `${doc._id}: a "${BLOCK_KEY}" paragraph exists with DIFFERENT text (an editor's?). ` +
          'Left alone; check it reads true:\n  ' +
          plainText(existing),
      );
    }
    continue;
  }

  const anchor = body.find((b) => b._key === ANCHOR_KEY);
  const path = `flexibleSections[_key=="${SECTION_KEY}"].body`;
  // Straight after the "what gets collected" paragraph. If an editor has
  // restructured the body and b14 is gone, append at the end and say so.
  const where = anchor ? `${path}[_key=="${ANCHOR_KEY}"]` : `${path}[-1]`;
  const placement = anchor
    ? `after "${plainText(anchor).slice(0, 48)}..."`
    : 'at the END of the body (anchor paragraph b14 not found)';

  changes++;
  await apply(`${doc._id}: insert form-storage paragraph ${placement}`, () =>
    client.patch(doc._id).ifRevisionId(doc._rev).insert('after', where, [newBlock]).commit(),
  );
}

if (changes) console.log(`\nParagraph text:\n  ${TEXT}`);
done(changes);
