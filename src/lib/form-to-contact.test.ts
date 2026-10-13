// Unit tests for the Sanity-form -> contact-endpoint mapping. Run with
// `npm run test:unit`. The two fixtures mirror the live dataset's forms
// (form.contact and form.express-interest) as of 2026-10-13.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mapFormToContact,
  validateFormValues,
  formSubject,
  type FormFieldDef,
} from './form-to-contact.ts';

const contactFields: FormFieldDef[] = [
  { label: 'Name', name: 'name', type: 'text', required: true },
  { label: 'Email', name: 'email', type: 'email', required: true },
  { label: 'Message', name: 'message', type: 'textarea', required: true },
];

const interestFields: FormFieldDef[] = [
  { label: 'First name', name: 'firstName', type: 'text', required: true },
  { label: 'Last name', name: 'lastName', type: 'text', required: true },
  { label: 'Email', name: 'email', type: 'email', required: true },
  { label: 'Phone (optional)', name: 'phone', type: 'tel' },
  { label: 'Course or topic of interest', name: 'courseInterest', type: 'select' },
  { label: 'Preferred term', name: 'term', type: 'select' },
  { label: 'Where are you in deciding?', name: 'decision', type: 'select' },
  { label: 'How did you hear about us?', name: 'heardAbout', type: 'select' },
  { label: 'What are you hoping to learn?', name: 'message', type: 'textarea' },
];

describe('mapFormToContact', () => {
  it('maps the plain contact form field for field', () => {
    const m = mapFormToContact({ title: 'Contact form' }, contactFields, {
      name: ' Ada Lovelace ',
      email: 'ada@example.com',
      message: 'Hello there',
    });
    assert.equal(m.name, 'Ada Lovelace');
    assert.equal(m.email, 'ada@example.com');
    assert.equal(m.subject, 'Contact form');
    assert.equal(m.message, 'Message: Hello there');
    assert.deepEqual(m.sourceField, { name: 'name', email: 'email', message: 'message' });
  });

  it('joins first and last name and folds every other answer into labelled lines', () => {
    const m = mapFormToContact({ title: 'Express interest' }, interestFields, {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
      phone: '555 0100',
      courseInterest: 'Scripture',
      term: '',
      decision: 'Just exploring',
      message: 'Line one\nLine two',
    });
    assert.equal(m.name, 'Ada Lovelace');
    assert.equal(m.subject, 'Express interest form');
    assert.equal(
      m.message,
      [
        'Phone (optional): 555 0100',
        'Course or topic of interest: Scripture',
        'Where are you in deciding?: Just exploring',
        'What are you hoping to learn?:',
        'Line one',
        'Line two',
      ].join('\n'),
    );
  });

  it('never sends an empty message', () => {
    const m = mapFormToContact({ title: 'Express interest' }, interestFields, {
      firstName: 'Ada',
      lastName: 'Lovelace',
      email: 'ada@example.com',
    });
    assert.ok(m.message.length > 0);
  });

  it('renders a ticked checkbox as Yes and drops an unticked one', () => {
    const fields: FormFieldDef[] = [
      ...contactFields,
      { label: 'Add me to the newsletter', name: 'optIn', type: 'checkbox' },
      { label: 'I can host a group', name: 'host', type: 'checkbox' },
    ];
    const m = mapFormToContact({ title: 'Contact form' }, fields, {
      name: 'A',
      email: 'a@example.com',
      message: 'Hi',
      optIn: true,
      host: false,
    });
    assert.equal(m.message, 'Message: Hi\nAdd me to the newsletter: Yes');
  });
});

describe('formSubject', () => {
  it('does not double the word form', () => {
    assert.equal(formSubject({ title: 'Contact form' }), 'Contact form');
    assert.equal(formSubject({ title: 'Wedding inquiry' }), 'Wedding inquiry form');
    assert.equal(formSubject({ heading: 'Request information' }), 'Request information form');
    assert.equal(formSubject({}), 'Website form');
  });
});

describe('validateFormValues', () => {
  it('flags each missing required field and a malformed email', () => {
    const errors = validateFormValues(interestFields, { firstName: 'Ada', email: 'nope' });
    assert.deepEqual(Object.keys(errors).sort(), ['email', 'lastName']);
    assert.match(errors.email, /does not look right/);
  });

  it('requires the reply address even when an editor left it optional', () => {
    const fields: FormFieldDef[] = [
      { label: 'Name', name: 'name', type: 'text' },
      { label: 'Email', name: 'email', type: 'email' },
    ];
    assert.deepEqual(Object.keys(validateFormValues(fields, {})).sort(), ['email', 'name']);
  });

  it('passes a complete submission', () => {
    assert.deepEqual(
      validateFormValues(contactFields, { name: 'A', email: 'a@example.com', message: 'Hi' }),
      {},
    );
  });
});
