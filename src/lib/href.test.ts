// Unit tests for the trailing-slash helper (run with `npm run test:unit`).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slashInternalLinks, withTrailingSlash } from './href.ts';

test('adds a slash to internal page paths, before ? and #', () => {
  assert.equal(withTrailingSlash('/about'), '/about/');
  assert.equal(withTrailingSlash('/courses/romans'), '/courses/romans/');
  assert.equal(withTrailingSlash('/contact?topic=a'), '/contact/?topic=a');
  assert.equal(withTrailingSlash('/faq#cost'), '/faq/#cost');
});

test('leaves everything else alone', () => {
  for (const v of [
    '/',
    '/about/',
    '#top',
    'https://example.com/x',
    '//cdn.example.com/x',
    'mailto:a@b.co',
    'tel:+15135550100',
    '/files/handbook.pdf',
    '/sitemap-index.xml',
    '/preview/about',
    '/studio',
  ]) {
    assert.equal(withTrailingSlash(v), v);
  }
});

test('slashInternalLinks walks nested link fields only', () => {
  const data = {
    title: '/about',
    cta: { href: '/pricing', ctaUrl: 'https://x.org/a' },
    list: [{ linkHref: '/faculty' }, { markDefs: [{ href: '/get-started?x=1' }] }],
  };
  slashInternalLinks(data);
  assert.equal(data.title, '/about');
  assert.equal(data.cta.href, '/pricing/');
  assert.equal(data.cta.ctaUrl, 'https://x.org/a');
  assert.equal(data.list[0].linkHref, '/faculty/');
  assert.equal((data.list[1] as any).markDefs[0].href, '/get-started/?x=1');
});
