// Wire the Web3Forms access key into the site forms (one-time setup; idempotent).
//
//   node scripts/seed-forms.mjs            (dry run: shows what it would do)
//   node scripts/seed-forms.mjs --apply    (write to the dataset)
//
// It does three things, none of which clobber existing values:
//   1. Sets the access key on the existing Express-interest form (only if blank),
//      so /get-started submits to Web3Forms instead of falling back to mailto.
//   2. Creates a simple Contact form (name / email / message) carrying the key.
//   3. Links that Contact form to the contact page, so /contact shows a real form
//      instead of the "Email the Office" mailto pill.
// All submissions land in the one Web3Forms inbox tied to the key. The Web3Forms
// access key is a PUBLIC form id (safe in client code, per the Web3Forms
// dashboard), so it lives in the Sanity form doc and ships to the browser.

import { createClient } from '@sanity/client';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const APPLY = process.argv.includes('--apply');

function parseEnv(p) {
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, 'utf-8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i === -1) continue;
    let v = t.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[t.slice(0, i).trim()] = v;
  }
  return out;
}
const env = { ...parseEnv(resolve(root, 'studio/.env')), ...parseEnv(resolve(root, '.env')), ...process.env };
const projectId = env.PUBLIC_SANITY_PROJECT_ID || env.SANITY_STUDIO_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET || env.SANITY_STUDIO_DATASET || 'production';
const token = env.SANITY_API_WRITE_TOKEN || env.SANITY_AUTH_TOKEN;
if (!projectId || !token) {
  console.error('Missing PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in .env');
  process.exit(1);
}
const client = createClient({ projectId, dataset, token, apiVersion: '2024-08-01', useCdn: false });

// PUBLIC Web3Forms access key (a form id, safe client-side). From the project's
// Web3Forms "Academy Contact Form". Replace for a new project.
const WEB3FORMS_KEY = 'bd5f2e57-6733-42c7-a4f5-a54aa4638068';
const NOTIFY_EMAIL = 'info@presbyterianacademy.org';

// A clean contact form: name / email / message, the standard trio.
const CONTACT_FORM = {
  _id: 'form.contact',
  _type: 'form',
  title: 'Contact form',
  slug: { _type: 'slug', current: 'contact' },
  mode: 'native',
  fields: [
    { _type: 'formField', _key: 'name', label: 'Name', name: 'name', type: 'text', required: true, width: 'full' },
    { _type: 'formField', _key: 'email', label: 'Email', name: 'email', type: 'email', required: true, width: 'full' },
    { _type: 'formField', _key: 'message', label: 'Message', name: 'message', type: 'textarea', required: true, width: 'full' },
  ],
  submitLabel: 'Send message',
  successMessage: 'Thank you. We will be in touch soon.',
  consentNote: 'By sending this you agree to our privacy policy',
  provider: { service: 'web3forms', accessKey: WEB3FORMS_KEY, notifyEmail: NOTIFY_EMAIL },
};

async function main() {
  console.log(`Wiring Web3Forms -> ${projectId}/${dataset}  (${APPLY ? 'APPLY' : 'DRY RUN'})\n`);

  // 1. Express-interest form: set the access key only if it is currently blank.
  const ei = await client.fetch(`*[_id == "form.express-interest"][0]{ _id, "key": provider.accessKey }`);
  if (ei && !ei.key) {
    console.log('  set form.express-interest.provider.accessKey');
    if (APPLY) await client.patch('form.express-interest').set({ 'provider.accessKey': WEB3FORMS_KEY }).commit();
  } else {
    console.log(`  form.express-interest: ${ei ? 'key already set' : 'form not found'} (skip)`);
  }

  // 2. Contact form: create if absent.
  const hasContactForm = await client.fetch(`defined(*[_id == "form.contact"][0]._id)`);
  if (!hasContactForm) {
    console.log(`  ${APPLY ? 'create' : 'would create'} form.contact (name / email / message, keyed)`);
    if (APPLY) await client.createIfNotExists(CONTACT_FORM);
  } else {
    console.log('  form.contact: already exists (skip)');
  }

  // 3. Link the contact form to the contact page, only if not already linked.
  const cp = await client.fetch(`*[_type == "contactPage"][0]{ _id, "ref": contactForm._ref }`);
  if (cp && !cp.ref) {
    console.log('  link contactPage.contactForm -> form.contact');
    if (APPLY) await client.patch(cp._id).set({ contactForm: { _type: 'reference', _ref: 'form.contact' } }).commit();
  } else {
    console.log(`  contactPage.contactForm: ${cp ? 'already linked' : 'contactPage not found'} (skip)`);
  }

  console.log(`\n${APPLY ? 'Done.' : 'Dry run complete. Re-run with --apply to write, then rebuild.'}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
