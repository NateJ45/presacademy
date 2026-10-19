// Safe to edit by hand (this site's own file; not part of the starter)
// =============================================================================
// Sample data for the screenshot and video scripts
// =============================================================================
// The Academy's dataset holds only its pages so far: no course, term, event or
// faculty member to show. Pictures and clips of Quick update and the editors
// need some, and they must never be real people. So the capture and recording
// scripts run with this module preloaded:
//
//     node --import ./tools/studio-media/sample-data.mjs tools/tutorial-videos/record.mjs <script.json>
//     node --import ./tools/studio-media/sample-data.mjs tools/guide-shots/capture.mjs
//
// It patches Playwright's `chromium.launch` so every browser context answers the
// Studio's reads (GROQ queries, single documents, live listeners) from
// tools/studio-media/sample-data.json instead of the real dataset, evaluating the
// Studio's own queries with groq-js. Nothing is sent to Sanity for those, and
// the shared scripts already refuse every write. Anything else (the Studio's own
// bundle, users, grants) goes to the network as usual.
//
// A query this module cannot evaluate answers with an empty list and a line on
// stderr, so a screen shows its empty state instead of an error.
// =============================================================================

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse, evaluate } from 'groq-js';

const HERE = dirname(fileURLToPath(import.meta.url));
const docs = JSON.parse(readFileSync(join(HERE, 'sample-data.json'), 'utf8')).documents;

/** The query and parameters of a Sanity data request (GET query string or POST body). */
function readQuery(request) {
  const url = new URL(request.url());
  if (request.method() === 'POST') {
    const body = JSON.parse(request.postData() || '{}');
    return { query: body.query ?? '', params: body.params ?? {} };
  }
  const params = {};
  for (const [k, v] of url.searchParams) {
    if (k.startsWith('$')) {
      try {
        params[k.slice(1)] = JSON.parse(v);
      } catch {
        params[k.slice(1)] = v;
      }
    }
  }
  return { query: url.searchParams.get('query') ?? '', params };
}

async function answerQuery(request) {
  const { query, params } = readQuery(request);
  const started = Date.now();
  let result = [];
  try {
    const tree = parse(query, { params });
    const value = await evaluate(tree, { dataset: docs, params, timestamp: new Date() });
    result = await value.get();
  } catch (err) {
    console.error(
      `[sample-data] could not evaluate: ${String(query).slice(0, 90)} (${err.message})`,
    );
  }
  return { query, result, ms: Date.now() - started, syncTags: ['s1:sample'] };
}

async function handle(route) {
  const request = route.request();
  const url = request.url();
  const cors = {
    'access-control-allow-origin': request.headers().origin ?? '*',
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': '*',
  };
  if (request.method() === 'OPTIONS') {
    return route.fulfill({ status: 204, headers: cors });
  }
  if (/\/data\/listen\//.test(url)) {
    // A listener that says hello and has nothing to report.
    return route.fulfill({
      status: 200,
      headers: { ...cors, 'content-type': 'text/event-stream', 'cache-control': 'no-cache' },
      body: 'event: welcome\ndata: {"listenerName":"sample"}\n\n',
    });
  }
  if (/\/data\/doc\//.test(url)) {
    const ids = decodeURIComponent(new URL(url).pathname.split('/').pop() ?? '').split(',');
    const documents = docs.filter((d) => ids.includes(d._id));
    return route.fulfill({
      status: 200,
      headers: { ...cors, 'content-type': 'application/json' },
      body: JSON.stringify({ documents, omitted: [] }),
    });
  }
  return route.fulfill({
    status: 200,
    headers: { ...cors, 'content-type': 'application/json' },
    body: JSON.stringify(await answerQuery(request)),
  });
}

const { chromium } = await import('@playwright/test');
const launch = chromium.launch.bind(chromium);
chromium.launch = async (...args) => {
  const browser = await launch(...args);
  const newContext = browser.newContext.bind(browser);
  browser.newContext = async (...a) => {
    // UTC, so a date written as "2027-01-11" reads 1/11/2027 on screen, whatever this PC's zone.
    const context = await newContext(
      { timezoneId: 'UTC', locale: 'en-US', ...(a[0] ?? {}) },
      ...a.slice(1),
    );
    await context.route(/\.sanity\.io\/v[\w-]+\/data\/(query|doc|listen)\//, handle);
    return context;
  };
  return browser;
};
