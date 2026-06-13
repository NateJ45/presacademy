// Seed FOCUSED placeholder school content into Sanity: teaching areas, terms,
// pricing tiers, faculty, courses, and testimonials. These are NEW document
// types the live church site never queries, so this import is non-destructive
// to the live site; it only lets the new /courses + /faculty pages render with
// content. Idempotent (createOrReplace on deterministic _ids), so re-running
// overwrites the same docs without duplicating. The eventual full seed
// (studio/starter-content.ndjson) supersedes this.
//
// Run: node scripts/seed-school-content.mjs            (dry run: lists docs)
//      node scripts/seed-school-content.mjs --apply    (writes to the dataset)
//
// Copy follows docs/brand/voice.md: no em-dashes, warm + plainspoken, no banned
// vocab. Placeholder only; the client replaces it in Studio later.

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@sanity/client';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const APPLY = process.argv.includes('--apply');

const env = Object.fromEntries(
  readFileSync(resolve(root, '.env'), 'utf-8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => { const [k, ...v] = l.split('='); return [k.trim(), v.join('=').trim()]; }),
);

const projectId = env.PUBLIC_SANITY_PROJECT_ID;
const dataset = env.PUBLIC_SANITY_DATASET ?? 'production';
const apiVersion = env.PUBLIC_SANITY_API_VERSION ?? '2026-05-01';
const token = env.SANITY_API_WRITE_TOKEN;
if (!projectId || !token) {
  console.error('Missing PUBLIC_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in .env');
  process.exit(1);
}

let _k = 0;
const key = () => `k${_k++}`;
const slug = (s) => ({ _type: 'slug', current: s });
const ref = (id) => ({ _type: 'reference', _ref: id });
const para = (text) => ({ _type: 'block', _key: key(), style: 'normal', markDefs: [], children: [{ _type: 'span', _key: key(), text, marks: [] }] });
const bio = (...texts) => texts.map(para);

// ---- Teaching areas -------------------------------------------------------
const areas = [
  ['ta.scripture', 'Scripture', 'Reading the Bible with both rigor and joy.'],
  ['ta.reformed-theology', 'Reformed Theology', 'The confessions and the convictions that shape us.'],
  ['ta.prayer', 'Prayer & the Spiritual Life', 'Practices that root a busy life in God.'],
  ['ta.church-history', 'Church History', 'The long story we belong to.'],
  ['ta.leading-group', 'Leading a Group', 'Forming others as you have been formed.'],
  ['ta.preaching', 'Preaching & Teaching', 'Handling the Word in front of people.'],
].map(([_id, title, description], i) => ({ _id, _type: 'teachingArea', title, slug: slug(_id.split('.')[1]), description, displayOrder: i + 1 }));

// ---- Terms ----------------------------------------------------------------
const terms = [
  { _id: 'term.fall-2026', title: 'Fall 2026', start: '2026-09-08', end: '2026-11-17', open: '2026-07-15', deadline: '2026-08-25', status: 'open', note: 'Evening cohorts, West Chester campus.' },
  { _id: 'term.spring-2027', title: 'Spring 2027', start: '2027-01-26', end: '2027-04-06', open: '2026-11-15', deadline: '2027-01-12', status: 'upcoming', note: 'Evening cohorts, West Chester campus.' },
  { _id: 'term.summer-2027', title: 'Summer 2027', start: '2027-06-08', end: '2027-07-20', open: '2027-04-15', deadline: '2027-05-25', status: 'upcoming', note: 'A shorter summer term.' },
].map((t) => ({ _id: t._id, _type: 'term', title: t.title, slug: slug(t._id.split('.')[1]), startDate: t.start, endDate: t.end, registrationOpens: t.open, registrationDeadline: t.deadline, status: t.status, note: t.note }));

// ---- Pricing tiers --------------------------------------------------------
const tiers = [
  { _id: 'tier.per-course', name: 'Per course', amount: 195, unit: 'per course', summary: 'One course, eight to ten evenings together.', includes: ['All sessions', 'The course reader', 'A cohort that learns together'], isAudit: false, featured: true, order: 1 },
  { _id: 'tier.audit', name: 'Audit', amount: 95, unit: 'per course', summary: 'Sit in, listen, and learn without the coursework.', includes: ['All sessions', 'The course reader'], isAudit: true, featured: false, order: 2 },
  { _id: 'tier.track', name: 'Full certificate track', amount: 1400, unit: 'per track', summary: 'Eight courses toward a certificate in Reformed formation.', includes: ['Eight courses', 'A faculty mentor', 'A certificate on completion'], isAudit: false, featured: false, order: 3 },
].map((t) => ({ _id: t._id, _type: 'pricingTier', name: t.name, slug: slug(t._id.split('.')[1]), amount: t.amount, unit: t.unit, summary: t.summary, includes: t.includes, isAudit: t.isAudit, featured: t.featured, displayOrder: t.order }));

// ---- Faculty --------------------------------------------------------------
const degree = (deg, field, institution, year) => ({ _key: key(), degree: deg, field, institution, year });
const affil = (role, organization) => ({ _key: key(), role, organization });
const pub = (title, publisher, year) => ({ _key: key(), title, publisher, year });

const faculty = [
  {
    _id: 'faculty.miriam-hale', honorific: 'Rev. Dr.', name: 'Miriam Hale', title: 'Teacher of Scripture',
    areas: ['ta.scripture', 'ta.reformed-theology'],
    degrees: [degree('PhD', 'New Testament', 'Princeton Theological Seminary', '2009'), degree('MDiv', '', 'Pittsburgh Theological Seminary', '2003'), degree('BA', 'Religion', 'The College of Wooster', '2000')],
    ordination: 'Ordained minister of Word and Sacrament', denomination: 'PC(USA)',
    affiliations: [affil('Ruling elder', 'Heritage Presbyterian Church'), affil('Member', 'Society of Biblical Literature')],
    yearsTeaching: 'Twenty years in the pulpit and the classroom',
    publications: [pub('The Whole Story', 'Eerdmans', '2018'), pub('Reading Together', 'Westminster John Knox', '2014')],
    humanLine: 'She makes the hardest passages feel like an open door, not a locked one.',
    bio: bio('Miriam has spent twenty years helping ordinary congregations read the Bible with both rigor and joy. Before joining the Academy she pastored two churches in Ohio and taught biblical studies as adjunct faculty.', 'She still preaches most months somewhere in the presbytery, and she believes the whole Bible is worth a lifetime of attention.'),
    order: 1,
  },
  {
    _id: 'faculty.samuel-okonkwo', honorific: 'Dr.', name: 'Samuel Okonkwo', title: 'Teacher of Systematic Theology',
    areas: ['ta.reformed-theology', 'ta.church-history'],
    degrees: [degree('PhD', 'Systematic Theology', 'University of Aberdeen', '2011'), degree('ThM', '', 'Westminster Theological Seminary', '2006'), degree('MDiv', '', 'Reformed Theological Seminary', '2004')],
    ordination: '', denomination: 'PC(USA)',
    affiliations: [affil('Theologian in residence', 'First Presbyterian Church')],
    yearsTeaching: 'Fifteen years teaching the confessions',
    publications: [pub('Confessing the Faith', 'Crossway', '2019')],
    humanLine: 'He treats old doctrine like good news you have not quite heard yet.',
    bio: bio('Samuel teaches the Reformed confessions as living documents, not museum pieces. His research traces how the Westminster Standards still speak to the questions ordinary believers carry into church on Sunday.', 'He came to the Reformed tradition as an adult, and he has never lost the convert’s gratitude for finding it.'),
    order: 2,
  },
  {
    _id: 'faculty.carla-jimenez', honorific: 'Rev.', name: 'Carla Jiménez', title: 'Teacher of Spiritual Formation',
    areas: ['ta.prayer', 'ta.leading-group'],
    degrees: [degree('DMin', 'Spiritual Formation', 'Fuller Theological Seminary', '2015'), degree('MDiv', '', 'Pittsburgh Theological Seminary', '2008')],
    ordination: 'Ordained minister', denomination: 'ECO',
    affiliations: [affil('Spiritual director', 'Three Rivers Retreat')],
    yearsTeaching: 'Eighteen years walking with small groups',
    publications: [],
    humanLine: 'She has a gift for making a room of strangers pray like old friends.',
    bio: bio('Carla pairs the depth of the Reformed tradition with the everyday practices that keep faith alive: prayer, Scripture, confession, and the slow work of a small group that sticks together.', 'She has led groups in living rooms, prisons, and church basements, and she will tell you the living rooms were the hardest.'),
    order: 3,
  },
  {
    _id: 'faculty.thomas-reese', honorific: 'Rev. Dr.', name: 'Thomas Reese', title: 'Teacher of Church History',
    areas: ['ta.church-history', 'ta.preaching'],
    degrees: [degree('PhD', 'Historical Theology', 'University of Notre Dame', '2007'), degree('MDiv', '', 'Princeton Theological Seminary', '2001')],
    ordination: 'Ordained minister of Word and Sacrament', denomination: 'PC(USA)',
    affiliations: [affil('Pastor', 'Covenant Presbyterian Church')],
    yearsTeaching: 'Twenty-two years in pastoral ministry',
    publications: [pub('The Long Reformation', 'Baker Academic', '2016')],
    humanLine: 'He tells the church’s history like it is your family’s story, because it is.',
    bio: bio('Thomas teaches history as a pastor, always asking what the saints who came before have to say to the church right now. His work on the Reformation has a stubborn habit of ending up in his sermons.', 'He has served the same congregation for fifteen years and has no plans to leave.'),
    order: 4,
  },
  {
    _id: 'faculty.naomi-whitfield', honorific: 'Dr.', name: 'Naomi Whitfield', title: 'Teacher of Preaching',
    areas: ['ta.preaching', 'ta.scripture'],
    degrees: [degree('PhD', 'Homiletics', 'Vanderbilt University', '2013'), degree('MDiv', '', 'Candler School of Theology', '2007')],
    ordination: '', denomination: 'PC(USA)',
    affiliations: [affil('Director', 'The Preaching Workshop')],
    yearsTeaching: 'A decade coaching preachers',
    publications: [pub('Say It Plainly', 'Abingdon', '2020')],
    humanLine: 'She can hear the sermon hiding inside your half-formed idea.',
    bio: bio('Naomi trains lay preachers and seasoned pastors alike to say true things plainly. Her workshop has helped hundreds of ordinary believers find their voice in front of a congregation.', 'She is convinced that good preaching is mostly good listening, done out loud.'),
    order: 5,
  },
].map((f) => ({
  _id: f._id, _type: 'facultyMember', name: f.name, honorific: f.honorific, slug: slug(f._id.split('.')[1]),
  title: f.title, teachingAreas: f.areas.map(ref), degrees: f.degrees,
  ordination: f.ordination || undefined, denomination: f.denomination,
  affiliations: f.affiliations, yearsTeaching: f.yearsTeaching,
  publications: f.publications, bio: f.bio, humanLine: f.humanLine, displayOrder: f.order,
}));

// ---- Courses --------------------------------------------------------------
const session = (title, focus) => ({ _key: key(), title, focus });
const offering = (termId, schedule, sessions, status) => ({ _key: key(), term: ref(termId), schedule, sessions, status });

const courses = [
  {
    _id: 'course.bible-one-story', title: 'Reading the Bible as One Story', summary: 'The Bible is not a box of disconnected verses. Over eight evenings we walk the whole arc, creation to new creation, and learn to read any passage in light of the one story it belongs to.',
    level: 'Intro', areas: ['ta.scripture'], instructors: ['faculty.miriam-hale'],
    offerings: [offering('term.fall-2026', 'Tuesdays, 7 to 9pm, 8 weeks', 8, 'open')],
    sessions: [session('Creation and covenant', 'Why the Bible opens the way it does.'), session('Exodus and the shape of redemption', 'The pattern that runs through everything after.'), session('Kings, prophets, and the long wait', 'Promise stretched across centuries.'), session('The Gospels: the story turns', 'Reading Jesus as the center, not a chapter.')],
    whoFor: ['Small-group and Sunday-school leaders who teach the text', 'Newcomers who want the big picture before the details', 'Lifelong readers who have never seen the whole arc at once'],
    priceTier: 'tier.per-course', priceNote: '$195, audit $95', featured: true, startHere: true, order: 1,
  },
  {
    _id: 'course.reformed-confessions', title: 'The Reformed Confessions, Plainly', summary: 'The Westminster Standards in plain words. We read the confession and catechisms together and ask what they have to say to ordinary believers today.',
    level: 'Foundational', areas: ['ta.reformed-theology'], instructors: ['faculty.samuel-okonkwo'],
    offerings: [offering('term.fall-2026', 'Wednesdays, 7 to 9pm, 6 weeks', 6, 'open')],
    sessions: [session('What a confession is for', 'Why a 400-year-old document still matters.'), session('God and his decrees', 'The doctrine people fear, taught as comfort.'), session('Grace from start to finish', 'Justification, sanctification, and assurance.'), session('The church and the means of grace', 'Word, sacrament, and prayer.')],
    whoFor: ['Anyone curious what Reformed actually means', 'Officers preparing for ordination exams', 'Believers who want their convictions clarified'],
    priceTier: 'tier.per-course', featured: true, startHere: false, order: 2,
  },
  {
    _id: 'course.prayer-psalms', title: 'Prayer and the Psalms', summary: 'The Psalms have taught the church to pray for three thousand years. We learn to pray them: in joy, in anger, in grief, and in plain ordinary faith.',
    level: 'Intro', areas: ['ta.prayer'], instructors: ['faculty.carla-jimenez'],
    offerings: [offering('term.fall-2026', 'Mondays, 7 to 9pm, 8 weeks', 8, 'open')],
    sessions: [session('Praying with words not your own', 'How the Psalms make room for you.'), session('The Psalms of lament', 'Bringing anger and grief to God.'), session('The Psalms of praise', 'Learning to mean it.'), session('Praying the Psalms together', 'A practice for your small group.')],
    whoFor: ['Anyone who finds prayer hard', 'Small-group leaders who want to pray better together', 'Believers in a season of grief or change'],
    priceTier: 'tier.per-course', featured: true, startHere: false, order: 3,
  },
  {
    _id: 'course.early-church-creeds', title: 'The Early Church and the Creeds', summary: 'Where did the Nicene Creed come from, and why should you care? We trace the first four centuries of the church and the convictions it fought to keep.',
    level: 'Foundational', areas: ['ta.church-history'], instructors: ['faculty.thomas-reese'],
    offerings: [offering('term.fall-2026', 'Thursdays, 7 to 9pm, 6 weeks', 6, 'open')],
    sessions: [session('A persecuted minority', 'The church before it was respectable.'), session('Who is Jesus?', 'The long fight for the Nicene Creed.'), session('One God in three persons', 'The Trinity, taught for ordinary believers.'), session('The creeds we still say', 'Why these words endure.')],
    whoFor: ['Believers who say the creeds without knowing the story', 'Teachers who want the history behind the doctrine', 'Anyone drawn to the ancient church'],
    priceTier: 'tier.per-course', featured: false, startHere: false, order: 4,
  },
  {
    _id: 'course.leading-small-group', title: 'Leading a Small Group with Depth', summary: 'Leading a group is more than hosting. Over ten weeks we build the skills to ask good questions, handle hard moments, and form people who keep growing after the study ends.',
    level: 'Advanced', areas: ['ta.leading-group'], instructors: ['faculty.carla-jimenez'],
    offerings: [offering('term.spring-2027', 'Tuesdays, 7 to 9pm, 10 weeks', 10, 'waitlist')],
    sessions: [session('What a group is for', 'Formation, not just information.'), session('Asking the question behind the question', 'Drawing people out.'), session('When it gets hard', 'Conflict, grief, and the quiet member.'), session('Sending them out', 'Helping a group multiply.')],
    whoFor: ['Current small-group and Bible-study leaders', 'Anyone asked to start a new group', 'Officers who shepherd other leaders'],
    priceTier: 'tier.per-course', featured: false, startHere: true, order: 5,
  },
  {
    _id: 'course.calvin-everyday', title: 'Calvin for Everyday Faith', summary: 'John Calvin wrote for ordinary believers, not just scholars. We read him slowly and find a pastor who has more to say about your daily life than you expect.',
    level: 'Foundational', areas: ['ta.reformed-theology'], instructors: ['faculty.miriam-hale'],
    offerings: [offering('term.fall-2026', 'Sundays, 4 to 6pm, 8 weeks', 8, 'open')],
    sessions: [session('Knowing God and ourselves', 'Where the Institutes begin.'), session('The Christian life', 'Calvin the pastor.'), session('Prayer', 'The chief exercise of faith.'), session('Living in the world', 'Vocation, money, and neighbor.')],
    whoFor: ['Believers curious about the man behind the tradition', 'Anyone put off by Calvin’s reputation', 'Readers who want a wise companion'],
    priceTier: 'tier.per-course', featured: true, startHere: false, order: 6,
  },
  {
    _id: 'course.preaching-gospels', title: 'Preaching the Gospel Texts', summary: 'A workshop for lay preachers and teachers. We learn to read a Gospel passage, find the sermon inside it, and say it plainly to real people.',
    level: 'Advanced', areas: ['ta.preaching'], instructors: ['faculty.naomi-whitfield'],
    offerings: [offering('term.spring-2027', 'Thursdays, 7 to 9pm, 8 weeks', 8, 'open')],
    sessions: [session('Reading for the sermon', 'What the text is doing.'), session('One thing, said well', 'Finding the single point.'), session('Plain words', 'Cutting the clutter.'), session('Standing up to preach', 'Delivery without fear.')],
    whoFor: ['Lay preachers and supply preachers', 'Sunday-school and Bible-study teachers', 'Anyone asked to give the message'],
    priceTier: 'tier.per-course', featured: false, startHere: false, order: 7,
  },
  {
    _id: 'course.story-reformation', title: 'The Story of the Reformation', summary: 'The Reformation was not one event but a long, messy, hopeful story. We follow it from Wittenberg to Geneva to Scotland and ask what we inherited from it.',
    level: 'Foundational', areas: ['ta.church-history'], instructors: ['faculty.samuel-okonkwo', 'faculty.thomas-reese'],
    offerings: [offering('term.summer-2027', 'Wednesdays, 7 to 9pm, 6 weeks', 6, 'open')],
    sessions: [session('Luther and a hammer', 'How it started.'), session('Geneva and Calvin', 'A city tries to reform.'), session('Scotland and Knox', 'The Reformed church we came from.'), session('What we kept', 'The Reformation in your pew today.')],
    whoFor: ['History-curious believers', 'Anyone who wonders why we are Presbyterian', 'Teachers who want the whole sweep'],
    priceTier: 'tier.per-course', featured: false, startHere: false, order: 8,
  },
].map((c) => ({
  _id: c._id, _type: 'course', title: c.title, slug: slug(c._id.split('.')[1]), summary: c.summary,
  level: c.level, format: 'In person', location: 'West Chester campus',
  teachingAreas: c.areas.map(ref), instructors: c.instructors.map(ref),
  offerings: c.offerings, sessionOutline: c.sessions, whoFor: c.whoFor,
  priceTier: ref(c.priceTier), priceNote: c.priceNote || undefined,
  featured: c.featured, startHere: c.startHere, displayOrder: c.order,
}));

// ---- Testimonials ---------------------------------------------------------
const testimonials = [
  { _id: 'testimonial.karen', quote: 'I have led a study for ten years. This is the first time I understood the book I was teaching.', name: 'Karen Doyle', role: 'Ruling elder', city: 'Mason, Ohio', course: 'course.bible-one-story', order: 1 },
  { _id: 'testimonial.james', quote: 'I came in nervous that it would be over my head. The teachers met me where I was and took me somewhere worth going.', name: 'James Carter', role: 'Sunday-school teacher', city: 'Hamilton, Ohio', course: null, order: 2 },
  { _id: 'testimonial.maria', quote: 'My small group prays differently now. That alone was worth the whole term.', name: 'Maria Alvarez', role: 'Small-group leader', city: 'West Chester, Ohio', course: 'course.prayer-psalms', order: 3 },
].map((t) => ({ _id: t._id, _type: 'testimonial', quote: t.quote, name: t.name, role: t.role, city: t.city, courseCompleted: t.course ? ref(t.course) : undefined, featured: true, displayOrder: t.order }));

// ---- Express-interest form ------------------------------------------------
const field = (label, name, type, opts = {}) => ({ _key: key(), _type: 'formField', label, name, type, ...opts });
const form = {
  _id: 'form.express-interest', _type: 'form',
  title: 'Express interest', slug: slug('express-interest'),
  heading: 'Request information', intro: 'Tell us what you are hoping to learn and we will help you find the right course.',
  mode: 'native',
  fields: [
    field('First name', 'firstName', 'text', { required: true, width: 'half' }),
    field('Last name', 'lastName', 'text', { required: true, width: 'half' }),
    field('Email', 'email', 'email', { required: true, width: 'full' }),
    field('Phone (optional)', 'phone', 'tel', { width: 'full' }),
    field('Course or topic of interest', 'courseInterest', 'select', { width: 'full', options: ['Scripture', 'Reformed Theology', 'Prayer & the Spiritual Life', 'Church History', 'Leading a Group', 'Preaching & Teaching', 'Not sure yet'] }),
    field('Preferred term', 'term', 'select', { width: 'half', options: ['Fall 2026', 'Spring 2027', 'Summer 2027', 'Whenever works'] }),
    field('Where are you in deciding?', 'decision', 'select', { width: 'half', options: ['Just exploring', 'Planning to enroll', 'Ready now'] }),
    field('How did you hear about us?', 'heardAbout', 'select', { width: 'full', options: ['A pastor or church', 'A friend or family member', 'Social media', 'An event', 'Search', 'Other'] }),
    field('What are you hoping to learn?', 'message', 'textarea', { width: 'full' }),
  ],
  submitLabel: 'Send', successMessage: 'Thank you. We will be in touch within a few days.',
  consentNote: 'We will only use your details to answer your inquiry.',
  provider: { service: 'web3forms', notifyEmail: 'info@presbyterianacademy.org' },
};

// ---- Page singletons ------------------------------------------------------
const cta = (label, href) => ({ _type: 'ctaBlock', label, linkType: 'external', externalUrl: href });
const step = (title, body) => ({ _key: key(), _type: 'getStartedStep', title, body });
const persona = (label, promise, c) => ({ _key: key(), _type: 'persona', label, promise, cta: c });

const coursesPage = {
  _id: 'coursesPage', _type: 'coursesPage',
  heroEyebrow: 'Catalog', heroHeadline: 'Courses',
  heroSubhead: 'Reformed formation taught in person, in cohorts. Browse by topic or teacher, and find a place to begin.',
  startHereEyebrow: 'Start here', startHereHeadline: 'New to the Academy? Begin with these.',
};
const facultyPage = {
  _id: 'facultyPage', _type: 'facultyPage',
  heroEyebrow: 'The faculty', heroHeadline: 'Taught by ministers and scholars',
  heroSubhead: 'The teachers are the heart of the Academy. Get to know them.',
  aggregateTrustLine: 'Every teacher is an ordained minister or a credentialed Reformed scholar.',
};
const pricingPage = {
  _id: 'pricingPage', _type: 'pricingPage',
  heroEyebrow: 'Tuition', heroHeadline: 'Pricing and scholarships',
  heroSubhead: 'What a course costs, said plainly, and how we keep formation within reach.',
  scholarshipEyebrow: 'Scholarships', scholarshipHeadline: 'No one is turned away for cost',
  scholarshipBody: 'Need-based scholarships are available every term, funded by our supporters. If tuition is a barrier, tell us on the interest form and we will work it out. Formation should be within reach of anyone called to it.',
};
const getStartedPage = {
  _id: 'getStartedPage', _type: 'getStartedPage',
  heroEyebrow: 'Get started', heroHeadline: 'Tell us what you want to learn',
  heroSubhead: 'Request information, book a free intro session, or download a course syllabus. No application fee, no pressure.',
  requestForm: ref('form.express-interest'),
  calendlyEyebrow: 'Or talk to us first', calendlyHeadline: 'Book a free intro session',
  calendlyBody: 'A short, no-pressure conversation about where you are and what fits.',
  visitClassBody: 'You are welcome to sit in on the first session of any course, free, before you decide.',
  syllabusBody: 'Every course page has a downloadable syllabus, so you can see exactly what a term covers.',
  stepsHeadline: 'What happens next',
  steps: [
    step('You tell us a little', 'A short form, just enough for us to point you in the right direction.'),
    step('We reply, person to person', 'A real teacher or staff member answers your questions within a few days.'),
    step('You try before you decide', 'Sit in on a class or book a free intro. Enroll only when you are ready.'),
  ],
};
const forYouPage = {
  _id: 'forYouPage', _type: 'forYouPage',
  heroEyebrow: 'Find your path', heroHeadline: 'Formation for where you are',
  heroSubhead: 'However you lead or learn, there is a starting point here for you.',
  personas: [
    persona('The small-group leader', 'Lead a study with more depth and less guesswork.', cta('Courses for leaders', '/courses')),
    persona('The lifelong learner', 'Finally read the whole Bible as one story.', cta('Start with Scripture', '/courses')),
    persona('New to Reformed thought', 'Understand what we believe, in plain words.', cta('Explore the confessions', '/courses')),
    persona('Discerning a call', 'Test the waters before seminary, in good company.', cta('Book a free intro', '/get-started')),
  ],
};
const resourcesPage = {
  _id: 'resourcesPage', _type: 'resourcesPage',
  heroEyebrow: 'Resources', heroHeadline: 'Teaching and formation essays',
  heroSubhead: 'Short reads from our faculty, free to everyone.',
  listIntro: 'Plainspoken essays on Scripture, theology, and the life of faith.',
};

const singletons = [form, coursesPage, facultyPage, pricingPage, getStartedPage, forYouPage, resourcesPage];

const docs = [...areas, ...terms, ...tiers, ...faculty, ...courses, ...testimonials, ...singletons];

console.log(`School placeholder content (${docs.length} docs):`);
const counts = docs.reduce((a, d) => ((a[d._type] = (a[d._type] || 0) + 1), a), {});
for (const [t, n] of Object.entries(counts)) console.log(`  ${t.padEnd(16)} ${n}`);

if (!APPLY) {
  console.log('\nDry run. Re-run with --apply to write to the dataset.');
  process.exit(0);
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false });
const tx = docs.reduce((t, d) => t.createOrReplace(d), client.transaction());
const res = await tx.commit();
console.log(`\nImported ${docs.length} docs. Transaction ${res.transactionId}.`);
