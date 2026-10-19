// Safe to edit by hand
// =============================================================================
// This site's "Watch how it is done" clips (PORTS.md card 137)
// =============================================================================
// A guide asks for a clip by KEY, as its `video` ('post-a-notice') or as a
// block in its body ({ kind: 'video', key: 'post-a-notice' }), and this file
// says where that clip's files are. The files live in public/guide-videos/ and
// are made by the recorder:
//
//     node tools/tutorial-videos/record.mjs tools/tutorial-videos/scripts/<slug>.json
//
// which prints the entry to paste below. A key with no entry plays nothing
// (the Watch button and the row hide themselves), so a guide never shows a
// broken player. src/lib/guide-videos.test.ts checks every entry (files
// present, a poster and captions, no em-dashes).
//
// Shape of an entry: GuideVideoData in src/lib/guide-videos.ts.
// =============================================================================

import type { GuideVideoData } from '../../lib/guide-videos.ts';

export const GUIDE_VIDEOS: Record<string, GuideVideoData> = {
  // 'post-a-notice': {
  //   title: 'Put up a notice',
  //   src: '/guide-videos/post-a-notice.mp4',
  //   webm: '/guide-videos/post-a-notice.webm',
  //   poster: '/guide-videos/post-a-notice.jpg',
  //   captions: '/guide-videos/post-a-notice.vtt',
  //   duration: 48,
  //   width: 1280,
  //   height: 800,
  // },
  'quick-updates': {
    title: 'Quick updates from your phone',
    src: '/guide-videos/quick-updates.mp4',
    webm: '/guide-videos/quick-updates.webm',
    poster: '/guide-videos/quick-updates.jpg',
    captions: '/guide-videos/quick-updates.vtt',
    duration: 25,
    width: 390,
    height: 844,
  },
  'mark-course-full': {
    title: 'Mark a course full or waitlisted',
    src: '/guide-videos/mark-course-full.mp4',
    webm: '/guide-videos/mark-course-full.webm',
    poster: '/guide-videos/mark-course-full.jpg',
    captions: '/guide-videos/mark-course-full.vtt',
    duration: 29,
    width: 390,
    height: 844,
  },
  'enrollment-reminder': {
    title: 'Remind people enrollment closes',
    src: '/guide-videos/enrollment-reminder.mp4',
    webm: '/guide-videos/enrollment-reminder.webm',
    poster: '/guide-videos/enrollment-reminder.jpg',
    captions: '/guide-videos/enrollment-reminder.vtt',
    duration: 20,
    width: 390,
    height: 844,
  },
  'cancel-a-class': {
    title: 'Cancel or move a class',
    src: '/guide-videos/cancel-a-class.mp4',
    webm: '/guide-videos/cancel-a-class.webm',
    poster: '/guide-videos/cancel-a-class.jpg',
    captions: '/guide-videos/cancel-a-class.vtt',
    duration: 25,
    width: 390,
    height: 844,
  },
  'add-info-session': {
    title: 'Add an info session with a sign-up link',
    src: '/guide-videos/add-info-session.mp4',
    webm: '/guide-videos/add-info-session.webm',
    poster: '/guide-videos/add-info-session.jpg',
    captions: '/guide-videos/add-info-session.vtt',
    duration: 35,
    width: 390,
    height: 844,
  },
  'new-term': {
    title: 'Open a new term',
    src: '/guide-videos/new-term.mp4',
    webm: '/guide-videos/new-term.webm',
    poster: '/guide-videos/new-term.jpg',
    captions: '/guide-videos/new-term.vtt',
    duration: 29,
    width: 1280,
    height: 800,
  },
};
