import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  htmlToRuns,
  htmlToInlineRich,
  inlineRichToHtml,
  runsToHtml,
  escapeHtml,
} from './inline-rich-write.ts';
import { inlineRichRuns } from './inline-rich.ts';

/** Predictable keys, so a whole document value can be asserted. */
function counter() {
  let n = 0;
  return () => `k${++n}`;
}

// -----------------------------------------------------------------------------
// HTML -> runs
// -----------------------------------------------------------------------------

test('plain text is one unmarked run', () => {
  assert.deepEqual(htmlToRuns('A quiet morning'), [
    { text: 'A quiet morning', strong: false, em: false },
  ]);
});

test('bold and italic tags become marks, in both spellings', () => {
  assert.deepEqual(htmlToRuns('one <b>two</b> <i>three</i>'), [
    { text: 'one ', strong: false, em: false },
    { text: 'two', strong: true, em: false },
    { text: ' ', strong: false, em: false },
    { text: 'three', strong: false, em: true },
  ]);
  assert.deepEqual(htmlToRuns('<strong>a</strong><em>b</em>'), [
    { text: 'a', strong: true, em: false },
    { text: 'b', strong: false, em: true },
  ]);
});

test('nesting carries both marks', () => {
  assert.deepEqual(htmlToRuns('<b>bold <i>and italic</i></b>'), [
    { text: 'bold ', strong: true, em: false },
    { text: 'and italic', strong: true, em: true },
  ]);
});

test('unknown tags keep their text and lose themselves', () => {
  assert.deepEqual(htmlToRuns('<div class="x"><a href="/y">link</a> text</div>'), [
    { text: 'link text', strong: false, em: false },
  ]);
});

test('script and style contribute nothing at all', () => {
  assert.deepEqual(htmlToRuns('safe<script>alert(1)</script> still safe'), [
    { text: 'safe still safe', strong: false, em: false },
  ]);
  assert.deepEqual(htmlToRuns('<style>p{color:red}</style>text'), [
    { text: 'text', strong: false, em: false },
  ]);
});

test('a browser that styled instead of tagged is still understood', () => {
  assert.deepEqual(htmlToRuns('<span style="font-weight: 700">heavy</span>'), [
    { text: 'heavy', strong: true, em: false },
  ]);
  assert.deepEqual(htmlToRuns("<span style='font-style:italic'>lean</span>"), [
    { text: 'lean', strong: false, em: true },
  ]);
  assert.deepEqual(htmlToRuns('<span class="plain">nothing</span>'), [
    { text: 'nothing', strong: false, em: false },
  ]);
});

test('line breaks become a single space, because the twin is one paragraph', () => {
  assert.deepEqual(htmlToRuns('one<br>two'), [{ text: 'one two', strong: false, em: false }]);
  assert.deepEqual(htmlToRuns('<div>one</div><div>two</div>'), [
    { text: 'one two', strong: false, em: false },
  ]);
});

test('entities are decoded, and a non-breaking space is a space', () => {
  assert.deepEqual(htmlToRuns('Tom &amp; Jerry &lt;3'), [
    { text: 'Tom & Jerry <3', strong: false, em: false },
  ]);
  assert.deepEqual(htmlToRuns('a&nbsp;b'), [{ text: 'a b', strong: false, em: false }]);
  assert.deepEqual(htmlToRuns('a&#160;b &#x41;'), [{ text: 'a b A', strong: false, em: false }]);
});

test('whitespace is squeezed and the ends are trimmed', () => {
  assert.deepEqual(htmlToRuns('  spaced \n\n out  '), [
    { text: 'spaced out', strong: false, em: false },
  ]);
  assert.deepEqual(htmlToRuns('<br>lead'), [{ text: 'lead', strong: false, em: false }]);
});

test('neighbours with the same marks are merged', () => {
  assert.deepEqual(htmlToRuns('<b>one</b><b>two</b>'), [
    { text: 'onetwo', strong: true, em: false },
  ]);
});

test('a lone angle bracket is text, not a tag', () => {
  assert.deepEqual(htmlToRuns('5 < 6'), [{ text: '5 < 6', strong: false, em: false }]);
});

test('an unbalanced close tag does not unwind the world', () => {
  assert.deepEqual(htmlToRuns('<b>bold</i> still bold</b> plain'), [
    { text: 'bold still bold', strong: true, em: false },
    { text: ' plain', strong: false, em: false },
  ]);
});

// -----------------------------------------------------------------------------
// HTML -> stored value
// -----------------------------------------------------------------------------

test('htmlToInlineRich builds one block of marked spans', () => {
  assert.deepEqual(htmlToInlineRich('Come <b>early</b>.', counter()), [
    {
      _type: 'block',
      _key: 'k1',
      style: 'normal',
      markDefs: [],
      children: [
        { _type: 'span', _key: 'k2', text: 'Come ', marks: [] },
        { _type: 'span', _key: 'k3', text: 'early', marks: ['strong'] },
        { _type: 'span', _key: 'k4', text: '.', marks: [] },
      ],
    },
  ]);
});

test('both marks are stored in a stable order', () => {
  const value = htmlToInlineRich('<em><strong>x</strong></em>', counter());
  assert.deepEqual(value[0].children?.[0].marks, ['strong', 'em']);
});

test('an emptied box stores nothing, so the plain string renders again', () => {
  assert.deepEqual(htmlToInlineRich('', counter()), []);
  assert.deepEqual(htmlToInlineRich('<br>', counter()), []);
  assert.deepEqual(htmlToInlineRich('   ', counter()), []);
  assert.deepEqual(htmlToInlineRich('<b></b>', counter()), []);
});

// -----------------------------------------------------------------------------
// stored value -> HTML, and the round trip
// -----------------------------------------------------------------------------

test('inlineRichToHtml seeds the box from what is stored', () => {
  const stored = [
    {
      _type: 'block',
      children: [
        { _type: 'span', text: 'Say ', marks: [] },
        { _type: 'span', text: 'yes', marks: ['strong', 'em'] },
      ],
    },
  ];
  assert.equal(inlineRichToHtml(stored), 'Say <strong><em>yes</em></strong>');
});

test('inlineRichToHtml is empty for an empty twin', () => {
  assert.equal(inlineRichToHtml(undefined), '');
  assert.equal(inlineRichToHtml([]), '');
});

test('markup in the text is escaped on the way out', () => {
  assert.equal(escapeHtml('a & b <c>'), 'a &amp; b &lt;c&gt;');
  assert.equal(
    runsToHtml([{ text: '<b>', strong: true, em: false }]),
    '<strong>&lt;b&gt;</strong>',
  );
});

test('a value survives the round trip unchanged', () => {
  const html = 'Doors open <strong>at ten</strong>, <em>sharp</em>.';
  const stored = htmlToInlineRich(html, counter());
  assert.equal(inlineRichToHtml(stored), html);
  assert.deepEqual(inlineRichRuns(stored), htmlToRuns(html));
});
