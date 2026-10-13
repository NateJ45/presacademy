// Foundation, edit with care
//
// Renders a configurable `form` document. Native mode builds inputs from
// form.fields; embed mode delegates to <Embed>.
//
// WHERE A NATIVE SUBMISSION GOES (2026-10-13, starter card 45). Every native
// form posts to the site's OWN Worker endpoint, /api/contact/
// (src/pages/api/contact.ts), through sendContactSubmission() in
// src/lib/contact-transport.ts. The endpoint stores the submission in D1
// first, then emails the Academy, so a failed send never loses an enquiry.
// Web3Forms and hCaptcha are gone from this file: no access key ships in the
// client bundle any more, and the form doc's old "Where submissions go"
// provider settings are ignored (hidden in Studio, kept in the schema so no
// stored data is orphaned).
//
// The endpoint has a fixed contract (name, email, subject, message), and an
// editor can build any fields. src/lib/form-to-contact.ts does the mapping:
// name from the name box(es), email from the Email field, subject naming the
// form, and every other answer folded into the message as "Label: value".
//
// SPAM, three layers, all checked server-side:
//   1. A honeypot input real people never see (sent as `company`; the input is
//      named `botcheck` so browser autofill never fills it for a real visitor).
//   2. `renderedAt`: a submission faster than a human could type is dropped.
//   3. Cloudflare Turnstile. The widget renders here; the token is verified by
//      the Worker against the TURNSTILE_SECRET secret.
//
// Turnstile sitekey: PUBLIC_TURNSTILE_SITEKEY when set at build time, else the
// live "PresAcad Contact Form" widget's public key. `astro dev` uses
// Cloudflare's always-pass TEST key, because the live key only works on
// presbyterianacademy.org. A local `wrangler dev` of the production build
// needs PUBLIC_TURNSTILE_SITEKEY=1x00000000000000000000AA at build time (see
// docs/agent/deployment.md, "Testing the forms locally").

import { useEffect, useRef, useState, type FormEvent } from 'react';
import Embed from './Embed';
import { sendContactSubmission } from '@/lib/contact-transport';
import {
  mapFormToContact,
  validateFormValues,
  type FormFieldDef,
  type FormValues,
} from '@/lib/form-to-contact';

export type { FormFieldDef } from '@/lib/form-to-contact';

export interface FormDoc {
  _id?: string;
  title?: string;
  heading?: string;
  intro?: string;
  mode?: 'native' | 'embed';
  fields?: FormFieldDef[];
  submitLabel?: string;
  successMessage?: string;
  consentNote?: string;
  embedUrl?: string | null;
  embedHtml?: string | null;
}

interface Props {
  form: FormDoc;
  /** Site contact email, offered to the visitor when a send fails. */
  fallbackEmail?: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

// ---- Turnstile -----------------------------------------------------------
// The live widget's sitekey is public by design (it is in every page that
// renders the widget). The SECRET lives only in the Worker.
const LIVE_TURNSTILE_SITEKEY = '0x4AAAAAADkwTp-Y5FB9AW8-';
// Cloudflare's documented always-pass test key, for local development.
const TEST_TURNSTILE_SITEKEY = '1x00000000000000000000AA';
const TURNSTILE_SITEKEY =
  (import.meta.env.PUBLIC_TURNSTILE_SITEKEY as string | undefined) ||
  (import.meta.env.DEV ? TEST_TURNSTILE_SITEKEY : LIVE_TURNSTILE_SITEKEY);
// Explicit render, so we choose the theme and size and can re-render the widget
// when the visitor toggles light/dark. The onload callback flips a ready flag.
const TURNSTILE_SCRIPT =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad';
// The "normal" widget is a fixed 300px wide. Narrower than that (a 320px phone
// inside the page gutters) it would push the page sideways, so use "compact".
const TURNSTILE_MIN_FLEX_WIDTH = 300;

interface TurnstileOptions {
  sitekey: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'flexible' | 'compact';
  callback?: (token: string) => void;
  'expired-callback'?: () => void;
  'error-callback'?: () => void;
  'response-field'?: boolean;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileOptions) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

const inputBase = 'w-full px-s py-s border bg-background text-foreground rounded-md min-h-[44px]';
const inputCls = `${inputBase} focus:outline-none focus:ring-2 focus:ring-ring`;

// A native <select> must NOT use focus:ring: ring is a box-shadow, WebKit drops
// box-shadow on natively-rendered form controls, and focus:outline-none then
// leaves Safari and iPhone visitors with no focus indicator (WCAG 2.4.7). No
// focus utilities here, so the global :focus-visible outline in globals.css
// (2px solid --ring, 2px offset) paints. Vault: webkit-drops-box-shadow-on-form-controls.
const selectCls = inputBase;

/** Border colour: the input token normally, the destructive token when invalid. */
const borderFor = (invalid: boolean) => (invalid ? 'border-destructive' : 'border-input');

export default function FormRenderer({ form, fallbackEmail }: Props) {
  if (!form) return null;

  // ---- Embed mode -------------------------------------------------------
  if (form.mode === 'embed') {
    const hasEmbed = form.embedUrl || form.embedHtml;
    if (!hasEmbed) return null;
    return (
      <div>
        {form.heading && <h2 className="font-display text-h3 text-foreground">{form.heading}</h2>}
        {form.intro && <p className="mt-s leading-relaxed text-foreground/80">{form.intro}</p>}
        <div className="mt-m">
          <Embed
            mode={form.embedUrl ? 'url' : 'html'}
            url={form.embedUrl ?? undefined}
            html={form.embedHtml ?? undefined}
            title={form.heading || form.title}
          />
        </div>
      </div>
    );
  }

  // ---- Native mode ------------------------------------------------------
  const fields = form.fields ?? [];
  const submitLabel = form.submitLabel || 'Send';
  const successMessage = form.successMessage || 'Thank you. We will be in touch soon.';
  const consentNote = form.consentNote;
  const emailSuffix = fallbackEmail ? ` You can also email us at ${fallbackEmail}.` : '';

  const [values, setValues] = useState<FormValues>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [botcheck, setBotcheck] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const formRef = useRef<HTMLFormElement | null>(null);
  // When the form appeared, for the server's "too fast to be human" check. Set
  // on mount (hydration), which is when a visitor could first start typing.
  const renderedAtRef = useRef<number>(0);

  // Turnstile: script loaded, resolved theme, container, widget id, token.
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [turnstileDark, setTurnstileDark] = useState(false);
  const [turnstileFailed, setTurnstileFailed] = useState(false);
  const turnstileRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | undefined>(undefined);
  const tokenRef = useRef<string>('');

  useEffect(() => {
    renderedAtRef.current = Date.now();
  }, []);

  // Track the resolved theme (the `dark` class ThemeToggle toggles on <html>)
  // so the widget matches the page and recolours live on a toggle.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const read = () => setTurnstileDark(document.documentElement.classList.contains('dark'));
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  // Load the Turnstile script once per page. Two forms on one page share it.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (window.turnstile) {
      setTurnstileReady(true);
      return;
    }
    const previous = window.onTurnstileLoad;
    window.onTurnstileLoad = () => {
      previous?.();
      setTurnstileReady(true);
    };
    if (document.getElementById('turnstile-script')) return;
    const s = document.createElement('script');
    s.id = 'turnstile-script';
    s.src = TURNSTILE_SCRIPT;
    s.async = true;
    s.defer = true;
    // A blocked or failed script must not leave the visitor guessing: the
    // server will refuse a tokenless send, so say so before they type.
    s.onerror = () => setTurnstileFailed(true);
    document.head.appendChild(s);
  }, []);

  // Render the widget once ready, and re-render it whenever the theme flips,
  // since Turnstile reads the theme only at render time. A re-render issues a
  // fresh token, so the old one is dropped.
  useEffect(() => {
    if (!turnstileReady || !window.turnstile || !turnstileRef.current) return;
    if (widgetIdRef.current !== undefined) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch {
        /* widget already gone */
      }
      widgetIdRef.current = undefined;
    }
    tokenRef.current = '';
    const narrow = turnstileRef.current.clientWidth < TURNSTILE_MIN_FLEX_WIDTH;
    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: TURNSTILE_SITEKEY,
      theme: turnstileDark ? 'dark' : 'light',
      size: narrow ? 'compact' : 'flexible',
      'response-field': false,
      callback: (token) => {
        tokenRef.current = token;
        setTurnstileFailed(false);
      },
      'expired-callback': () => {
        tokenRef.current = '';
      },
      'error-callback': () => {
        tokenRef.current = '';
        setTurnstileFailed(true);
      },
    });
    return () => {
      if (widgetIdRef.current !== undefined) {
        try {
          window.turnstile?.remove(widgetIdRef.current);
        } catch {
          /* widget already gone */
        }
        widgetIdRef.current = undefined;
      }
    };
  }, [turnstileReady, turnstileDark]);

  function setField(name: string, value: string | boolean) {
    setValues((v) => ({ ...v, [name]: value }));
    // Clear that field's error as soon as the visitor edits it.
    if (fieldErrors[name]) {
      setFieldErrors((errs) => {
        const next = { ...errs };
        delete next[name];
        return next;
      });
      // The last highlighted field is fixed: the "please fix" summary above
      // the form is no longer true, so drop it too.
      if (Object.keys(fieldErrors).length === 1) setErrorMsg('');
    }
  }

  function focusField(name: string) {
    formRef.current?.querySelector<HTMLElement>(`[name="${name}"]`)?.focus();
  }

  /** Tokens are single-use: after any attempt, ask Turnstile for a new one. */
  function resetTurnstile() {
    tokenRef.current = '';
    if (widgetIdRef.current !== undefined) {
      try {
        window.turnstile?.reset(widgetIdRef.current);
      } catch {
        /* widget already gone */
      }
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg('');

    const errors = validateFormValues(fields, values);
    setFieldErrors(errors);
    const firstInvalid = fields.find((f) => errors[f.name]);
    if (firstInvalid) {
      setStatus('idle');
      setErrorMsg(
        Object.keys(errors).length === 1
          ? 'Please fix the highlighted field.'
          : `Please fix the ${Object.keys(errors).length} highlighted fields.`,
      );
      focusField(firstInvalid.name);
      return;
    }

    // The widget rendered but has not produced a token yet (managed mode
    // usually finishes in a second or two, or is waiting on a checkbox).
    if (widgetIdRef.current !== undefined && !tokenRef.current && !turnstileFailed) {
      setErrorMsg('The spam check has not finished yet. Give it a moment, then send again.');
      return;
    }

    const mapped = mapFormToContact(form, fields, values);
    setStatus('submitting');
    const result = await sendContactSubmission({
      name: mapped.name,
      email: mapped.email,
      subject: mapped.subject,
      message: mapped.message,
      company: botcheck,
      renderedAt: renderedAtRef.current || undefined,
      turnstileToken: tokenRef.current || null,
    });

    if (result.ok) {
      // The success message replaces the form, taking the widget's container
      // with it. Remove the widget first, while Turnstile can still find it.
      if (widgetIdRef.current !== undefined) {
        try {
          window.turnstile?.remove(widgetIdRef.current);
        } catch {
          /* widget already gone */
        }
        widgetIdRef.current = undefined;
      }
      setStatus('success');
      return;
    }

    resetTurnstile();
    setStatus('error');

    // The server's field errors are keyed name / email / message. Put each one
    // beside the box the visitor has to change.
    const serverErrors: Record<string, string> = {};
    const unplaced: string[] = [];
    for (const [key, msg] of Object.entries(result.errors ?? {})) {
      const target = mapped.sourceField[key as keyof typeof mapped.sourceField];
      if (target) serverErrors[target] = msg;
      else unplaced.push(msg);
    }
    if (Object.keys(serverErrors).length) {
      setFieldErrors(serverErrors);
      const first = fields.find((f) => serverErrors[f.name]);
      if (first) focusField(first.name);
    }
    setErrorMsg(
      unplaced.length
        ? `${unplaced.join(' ')}${emailSuffix}`
        : Object.keys(serverErrors).length
          ? 'Please fix the highlighted field and send again.'
          : `${result.error ?? 'Sorry, that did not send.'}${emailSuffix}`,
    );
  }

  if (status === 'success') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-md border border-primary bg-muted p-l"
      >
        <p className="font-display text-h4 text-foreground">{successMessage}</p>
      </div>
    );
  }

  return (
    <div>
      {form.heading && <h2 className="font-display text-h3 text-foreground">{form.heading}</h2>}
      {form.intro && <p className="mt-s leading-relaxed text-foreground/80">{form.intro}</p>}

      <form
        ref={formRef}
        onSubmit={onSubmit}
        noValidate
        className="mt-m"
        aria-busy={status === 'submitting'}
      >
        {/* Honeypot. Hidden from people and assistive tech; bots fill it in. */}
        <div
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}
        >
          <label>
            Leave blank
            <input
              type="text"
              name="botcheck"
              tabIndex={-1}
              autoComplete="off"
              value={botcheck}
              onChange={(e) => setBotcheck(e.target.value)}
            />
          </label>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mb-s rounded-md border border-destructive bg-destructive/10 p-s text-sm text-foreground"
          >
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 gap-s sm:grid-cols-2">
          {fields.map((f) => {
            const id = `f-${f.name}`;
            const span = f.width === 'half' ? 'sm:col-span-1' : 'sm:col-span-2';
            const err = fieldErrors[f.name];
            const helpId = f.helpText ? `${id}-help` : undefined;
            const errId = err ? `${id}-error` : undefined;
            const describedBy = [errId, helpId].filter(Boolean).join(' ') || undefined;
            const errorLine = err && (
              <p
                id={errId}
                className="mt-1 border-l-2 border-destructive pl-s text-sm font-semibold text-foreground"
              >
                {err}
              </p>
            );
            if (f.type === 'checkbox') {
              return (
                <div key={f.name} className={span}>
                  <div className="flex min-h-[44px] items-center gap-s">
                    <input
                      id={id}
                      name={f.name}
                      type="checkbox"
                      checked={!!values[f.name]}
                      onChange={(e) => setField(f.name, e.target.checked)}
                      aria-invalid={err ? true : undefined}
                      aria-describedby={describedBy}
                      className="check-44"
                    />
                    <label htmlFor={id} className="text-sm text-foreground">
                      {f.label}
                      {f.required && ' *'}
                    </label>
                  </div>
                  {errorLine}
                </div>
              );
            }
            const common = {
              id,
              name: f.name,
              value: (values[f.name] as string) || '',
              'aria-invalid': err ? true : undefined,
              'aria-describedby': describedBy,
              'aria-required': f.required ? true : undefined,
            };
            return (
              <div key={f.name} className={span}>
                <label htmlFor={id} className="mb-1 block text-sm font-semibold text-foreground">
                  {f.label}
                  {f.required && ' *'}
                </label>
                {f.type === 'textarea' ? (
                  <textarea
                    {...common}
                    rows={4}
                    placeholder={f.placeholder}
                    onChange={(e) => setField(f.name, e.target.value)}
                    className={`${selectCls} ${borderFor(!!err)}`}
                  />
                ) : f.type === 'select' ? (
                  <select
                    {...common}
                    onChange={(e) => setField(f.name, e.target.value)}
                    className={`${inputCls} ${borderFor(!!err)}`}
                  >
                    <option value="">Select…</option>
                    {(f.options ?? []).map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    {...common}
                    type={f.type}
                    placeholder={f.placeholder}
                    autoComplete={
                      f.type === 'email' ? 'email' : f.type === 'tel' ? 'tel' : undefined
                    }
                    onChange={(e) => setField(f.name, e.target.value)}
                    className={`${inputCls} ${borderFor(!!err)}`}
                  />
                )}
                {errorLine}
                {f.helpText && (
                  <p id={helpId} className="mt-1 text-xs text-foreground/70">
                    {f.helpText}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Turnstile renders explicitly into this box (effects above) so it
            matches and follows the site theme. min-h holds the space while the
            script loads, so the button does not jump. */}
        <div ref={turnstileRef} className="mt-m min-h-[65px] max-w-full" />
        {turnstileFailed && (
          <p className="mt-1 text-sm text-foreground/80">
            The spam check could not load. If sending fails, check your connection or turn off a
            content blocker for this site.{emailSuffix}
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="press-tactile mt-m inline-flex min-h-[44px] items-center justify-center rounded-full bg-primary px-l py-s text-xs font-semibold tracking-[0.18em] text-primary-foreground uppercase transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'submitting' ? 'Sending…' : submitLabel}
        </button>
        {/* Announces the sending state to screen readers without moving focus. */}
        <p className="sr-only" role="status" aria-live="polite">
          {status === 'submitting' ? 'Sending your message.' : ''}
        </p>
      </form>

      {consentNote && (
        <p className="mt-s text-xs leading-relaxed text-foreground/70">
          {consentNote.includes('privacy policy') ? (
            <>
              {consentNote.replace('privacy policy', '').trimEnd()}{' '}
              <a
                href="/privacy/"
                className="underline underline-offset-2 transition-colors hover:text-link"
              >
                privacy policy
              </a>
              .
            </>
          ) : (
            consentNote
          )}
        </p>
      )}
    </div>
  );
}
