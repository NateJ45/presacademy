// Tests for scripts/lib/production-guard.mjs, the production second factor on the
// scripts that build their own Sanity client (PORTS.md card 86, step 3).
//
// The guard is NEVER tested against production. Every child process gets a fake
// project, a fake token, PUBLIC_SANITY_DATASET=production and
// SANITY_API_HOST=https://example.invalid (a reserved name that cannot resolve), all
// in process.env, which wins over any real .env. Only --apply runs are spawned, and
// the guard stops them before any request; even a broken guard would only reach a
// fake project with a fake token.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { productionWriteRefusal } from './production-guard.mjs';

const GUARD = new URL('./production-guard.mjs', import.meta.url).href;
const SCRIPTS = fileURLToPath(new URL('..', import.meta.url));

const FAKE = {
  PUBLIC_SANITY_PROJECT_ID: 'fake0000',
  SANITY_STUDIO_PROJECT_ID: 'fake0000',
  SANITY_API_WRITE_TOKEN: 'fake-token',
  SANITY_AUTH_TOKEN: 'fake-token',
  PUBLIC_SANITY_DATASET: 'production',
  SANITY_API_HOST: 'https://example.invalid',
};

function childEnv(extra = {}) {
  const env = { ...process.env, ...FAKE, ...extra };
  if (!('NCS_PRODUCTION_WRITE' in extra)) delete env.NCS_PRODUCTION_WRITE;
  return env;
}

// --- the pure check -----------------------------------------------------------
test('a dry run never needs the second factor', () => {
  assert.equal(
    productionWriteRefusal({ apply: false, dataset: 'production', processEnv: {} }),
    null,
  );
});

test('--apply on production without NCS_PRODUCTION_WRITE is refused', () => {
  const r = productionWriteRefusal({ apply: true, dataset: 'production', processEnv: {} });
  assert.match(r, /NCS_PRODUCTION_WRITE=yes/);
});

test('only the exact value "yes" opens it', () => {
  for (const v of ['1', 'true', 'YES', ' yes', '']) {
    assert.notEqual(
      productionWriteRefusal({
        apply: true,
        dataset: 'production',
        processEnv: { NCS_PRODUCTION_WRITE: v },
      }),
      null,
      `value ${JSON.stringify(v)} must not open the guard`,
    );
  }
  assert.equal(
    productionWriteRefusal({
      apply: true,
      dataset: 'production',
      processEnv: { NCS_PRODUCTION_WRITE: 'yes' },
    }),
    null,
  );
});

test('a non-production dataset needs only --apply', () => {
  assert.equal(productionWriteRefusal({ apply: true, dataset: 'staging', processEnv: {} }), null);
});

// --- the real guard, in a child process, against https://example.invalid ------
function runFixture(extraEnv) {
  const dir = mkdtempSync(join(tmpdir(), 'production-guard-'));
  const file = join(dir, 'write.mjs');
  writeFileSync(
    file,
    [
      `import { guardProductionWrite } from ${JSON.stringify(GUARD)};`,
      `guardProductionWrite({ apply: process.argv.includes('--apply'), dataset: process.env.PUBLIC_SANITY_DATASET });`,
      `try {`,
      `  await fetch(process.env.SANITY_API_HOST + '/v1/data/mutate/production', { method: 'POST' });`,
      `  console.log('NO-ERROR');`,
      `} catch (err) {`,
      `  console.log('REQUEST-FAILED ' + (err.cause?.code || err.message));`,
      `  process.exit(3);`,
      `}`,
    ].join('\n'),
  );
  try {
    return spawnSync(process.execPath, [file, '--apply'], {
      env: childEnv(extraEnv),
      encoding: 'utf8',
      timeout: 30_000,
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('without the variable the guard exits 2 before any request', () => {
  const r = runFixture({});
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /Refusing to write/);
  assert.doesNotMatch(r.stdout, /REQUEST-FAILED|NO-ERROR/);
});

test('with NCS_PRODUCTION_WRITE=yes the request is attempted (and fails on the dummy host)', () => {
  const r = runFixture({ NCS_PRODUCTION_WRITE: 'yes' });
  assert.equal(r.status, 3, r.stderr + r.stdout);
  assert.match(r.stdout, /REQUEST-FAILED/);
});

// --- every own-client write script is wired to it ------------------------------
// These run the real scripts with --apply and the fake env above. The guard sits
// before the token check and before the client is used, so each must exit 2.
const RUNNABLE = [
  'fix-missing-keys.mjs',
  'seed-academic-images.mjs',
  'seed-editability.mjs',
  'seed-live-singletons.mjs',
  'seed-page-copy.mjs',
  'seed-school-content.mjs',
];

for (const script of RUNNABLE) {
  test(`${script} --apply on production is refused without the variable`, () => {
    const r = spawnSync(process.execPath, [join(SCRIPTS, script), '--apply'], {
      env: childEnv({}),
      encoding: 'utf8',
      timeout: 30_000,
    });
    assert.equal(r.status, 2, `${script}: ${r.stderr}${r.stdout}`);
    assert.match(r.stderr, /Refusing to write/);
  });
}

// sanity-apply-asset-patches.mjs runs inside `sanity exec`, so it is checked by
// source: the guard is called before the transaction is committed.
test('every own-client write script calls the guard before it writes', () => {
  for (const script of [...RUNNABLE, 'sanity-apply-asset-patches.mjs']) {
    const src = readFileSync(join(SCRIPTS, script), 'utf8');
    const guardAt = src.indexOf('guardProductionWrite({');
    assert.ok(guardAt > 0, `${script} does not call guardProductionWrite`);
    for (const write of ['.commit(', 'createIfNotExists(', 'createOrReplace(', '/mutate/']) {
      const at = src.indexOf(write);
      if (at !== -1) assert.ok(guardAt < at, `${script}: ${write} appears before the guard`);
    }
  }
});
