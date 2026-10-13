import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  INTRO_LENGTH_PATTERN,
  hasAudioAsset,
  introAudioFor,
  transcriptParagraphs,
  transcriptRule,
} from './intro-audio.ts';

const UPLOADED = { _type: 'file', asset: { _ref: 'file-abc-mp3', _type: 'reference' } };

describe('hasAudioAsset', () => {
  it('is true only when the file field holds an asset reference', () => {
    assert.equal(hasAudioAsset(UPLOADED), true);
    assert.equal(hasAudioAsset({ _type: 'file' }), false);
    assert.equal(hasAudioAsset(undefined), false);
    assert.equal(hasAudioAsset(null), false);
  });
});

describe('transcriptRule (WCAG 1.2.1)', () => {
  it('passes when there is no recording, transcript or not', () => {
    assert.equal(transcriptRule(undefined, undefined), true);
    assert.equal(transcriptRule('', { _type: 'file' }), true);
  });
  it('fails when a recording has no transcript, or only whitespace', () => {
    assert.equal(typeof transcriptRule(undefined, UPLOADED), 'string');
    assert.equal(typeof transcriptRule('   \n ', UPLOADED), 'string');
  });
  it('passes when a recording has a transcript', () => {
    assert.equal(transcriptRule('Welcome to the class.', UPLOADED), true);
  });
});

describe('introAudioFor', () => {
  const base = {
    introAudio: { url: 'https://cdn.sanity.io/files/x/production/a.mp3', mimeType: 'audio/mpeg' },
    introAudioTranscript: '  Welcome.\n\nSecond paragraph.  ',
    introAudioLength: ' 1:32 ',
  };
  it('returns trimmed player props when file and transcript are both present', () => {
    assert.deepEqual(introAudioFor(base), {
      src: 'https://cdn.sanity.io/files/x/production/a.mp3',
      mimeType: 'audio/mpeg',
      transcript: 'Welcome.\n\nSecond paragraph.',
      length: '1:32',
    });
  });
  it('hides the player without a transcript, even if the file is there', () => {
    assert.equal(introAudioFor({ ...base, introAudioTranscript: '' }), null);
    assert.equal(introAudioFor({ ...base, introAudioTranscript: null }), null);
  });
  it('hides the player without a file', () => {
    assert.equal(introAudioFor({ ...base, introAudio: null }), null);
    assert.equal(introAudioFor({}), null);
    assert.equal(introAudioFor(null), null);
  });
  it('treats an empty length as no length', () => {
    assert.equal(introAudioFor({ ...base, introAudioLength: '' })?.length, null);
  });
});

describe('transcriptParagraphs', () => {
  it('splits on blank lines and drops empties', () => {
    assert.deepEqual(transcriptParagraphs('One.\n\n  \nTwo.\nstill two.\n\n'), [
      'One.',
      'Two.\nstill two.',
    ]);
  });
});

describe('INTRO_LENGTH_PATTERN', () => {
  it('accepts minutes:seconds and rejects other shapes', () => {
    for (const ok of ['1:32', '0:45', '12:05']) assert.ok(INTRO_LENGTH_PATTERN.test(ok), ok);
    for (const bad of ['1:60', '90 seconds', '1.32', ':32', '123:00'])
      assert.ok(!INTRO_LENGTH_PATTERN.test(bad), bad);
  });
});
