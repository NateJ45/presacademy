// Safe to edit by hand
//
// Maps a Sanity-built form (any fields an editor configured) onto the contact
// endpoint's fixed contract: name, email, subject, message. Pure, no React, no
// fetch, so it is unit-tested in form-to-contact.test.ts.
//
// WHY A MAPPING AT ALL. /api/contact/ (src/pages/api/contact.ts, a PORTABLE
// starter file, card 45) stores four columns and emails them. The Academy's
// forms are built in Studio and can hold any fields: the contact form has
// Name / Email / Message, the express-interest form has First name, Last name,
// Email, Phone and four dropdowns. So:
//
//   - name     a field keyed `name` / `fullName`, else first + last name joined
//   - email    the first Email-type field (or one keyed `email`)
//   - subject  identifies WHICH form was used, from the form's internal name
//   - message  every other answered field as a "Label: value" line, in the
//              order the editor arranged them, so nothing a visitor typed is
//              lost and the email reads in the same order as the form
//
// Site-specific on purpose: the starter's ContactForm has fixed fields, this
// site's forms are editor-built.

export interface FormFieldDef {
  label: string;
  name: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'date';
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  width?: 'full' | 'half';
}

export type FormValues = Record<string, string | boolean | undefined>;

export interface MappedSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
  /**
   * Which form field each endpoint field came from, so a server-side
   * validation error ("Please tell us your name.") can be shown next to the
   * box the visitor actually has to fix.
   */
  sourceField: { name?: string; email?: string; message?: string };
}

/** A visitor-readable value: checkboxes become Yes, blanks become ''. */
export function formatValue(v: string | boolean | undefined): string {
  if (v === true) return 'Yes';
  if (v === false || v == null) return '';
  return String(v).trim();
}

const FULL_NAME = /^(name|full_?name|your_?name)$/i;
const FIRST_NAME = /^(first_?name|first|given_?name|forename)$/i;
const LAST_NAME = /^(last_?name|last|surname|family_?name)$/i;

/** The form fields that together make up the sender's name, in order. */
export function nameFields(fields: FormFieldDef[]): FormFieldDef[] {
  const text = fields.filter((f) => f.type === 'text');
  const full = text.find((f) => FULL_NAME.test(f.name));
  if (full) return [full];
  const first = text.find((f) => FIRST_NAME.test(f.name));
  const last = text.find((f) => LAST_NAME.test(f.name));
  const pair = [first, last].filter((f): f is FormFieldDef => Boolean(f));
  if (pair.length) return pair;
  // Last resort: an editor keyed the field oddly but labelled it plainly.
  const labelled = text.find((f) => /\bname\b/i.test(f.label));
  return labelled ? [labelled] : [];
}

/** The field that holds the reply address. */
export function emailField(fields: FormFieldDef[]): FormFieldDef | undefined {
  return fields.find((f) => f.type === 'email') ?? fields.find((f) => /^e-?mail$/i.test(f.name));
}

/** "Express interest" -> "Express interest form". Falls back to the heading. */
export function formSubject(form: { title?: string; heading?: string }): string {
  const base = (form.title || form.heading || 'Website').trim();
  return /\bform$/i.test(base) ? base : `${base} form`;
}

export function mapFormToContact(
  form: { title?: string; heading?: string },
  fields: FormFieldDef[],
  values: FormValues,
): MappedSubmission {
  const names = nameFields(fields);
  const mail = emailField(fields);
  const used = new Set<string>([...names.map((f) => f.name), ...(mail ? [mail.name] : [])]);

  const name = names
    .map((f) => formatValue(values[f.name]))
    .filter(Boolean)
    .join(' ');
  const email = mail ? formatValue(values[mail.name]) : '';

  const lines: string[] = [];
  for (const f of fields) {
    if (used.has(f.name)) continue;
    const v = formatValue(values[f.name]);
    if (!v) continue;
    // A multi-line answer keeps its own line breaks under its label.
    lines.push(v.includes('\n') ? `${f.label}:\n${v}` : `${f.label}: ${v}`);
  }

  // The endpoint refuses an empty message. A visitor who filled in only the
  // required name and email still deserves a reply, so say so plainly rather
  // than bouncing them for leaving optional boxes empty.
  const message = lines.length
    ? lines.join('\n')
    : '(No other details given: only a name and email address.)';

  const textarea = fields.find((f) => f.type === 'textarea' && !used.has(f.name));

  return {
    name,
    email,
    subject: formSubject(form),
    message,
    sourceField: {
      name: names[0]?.name,
      email: mail?.name,
      message: textarea?.name,
    },
  };
}

/** True when the value is a plausible email address (same rule as the server). */
export function looksLikeEmailAddress(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

/**
 * Client-side check of the editor's Required flags and the email format. Field
 * name to a visitor-readable problem; empty means the form can be sent.
 *
 * The reply address and the (first) name box are treated as required even if
 * an editor left them optional, because the endpoint refuses a submission
 * without them; better to say so beside the box than after a round trip.
 */
export function validateFormValues(
  fields: FormFieldDef[],
  values: FormValues,
): Record<string, string> {
  const errors: Record<string, string> = {};
  const mustHave = new Set<string>(
    [nameFields(fields)[0]?.name, emailField(fields)?.name].filter((n): n is string => !!n),
  );
  for (const f of fields) {
    const v = values[f.name];
    if (f.type === 'checkbox') {
      if (f.required && !v) errors[f.name] = `Please check "${f.label}" to continue.`;
      continue;
    }
    const text = formatValue(v);
    if ((f.required || mustHave.has(f.name)) && !text) {
      errors[f.name] = `Please fill in "${f.label}".`;
      continue;
    }
    if (f.type === 'email' && text && !looksLikeEmailAddress(text)) {
      errors[f.name] = 'That email address does not look right.';
    }
  }
  return errors;
}
