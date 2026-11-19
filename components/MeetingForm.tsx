'use client';

import { useActionState, useId } from 'react';
import Link from 'next/link';
import {
  SPEAKER_ROWS,
  initialMeetingFormState,
  type MeetingFormState,
  type MeetingFormValues,
} from '@/lib/meeting-form';
import { MEETING_TYPE_LABELS } from '@/lib/meeting-utils';
import type { MeetingType } from '@/lib/types';

type FormAction = (state: MeetingFormState, formData: FormData) => Promise<MeetingFormState>;

interface MeetingFormProps {
  action: FormAction;
  submitLabel: string;
  /** Starting values when editing an existing meeting. */
  initialValues?: MeetingFormValues;
  /** Where Cancel goes (the list for a new meeting, the meeting itself when editing). */
  cancelHref?: string;
}

const MEETING_TYPES: MeetingType[] = ['regular', 'testimony', 'special', 'stake', 'general'];

const inputClass =
  'w-full rounded-lg border border-line bg-card px-3 py-2 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 aria-[invalid=true]:border-red-700';
const labelClass = 'mb-1 block text-sm font-semibold text-ink';
const fieldsetClass = 'rounded-xl border border-line bg-card p-5';
const legendClass = 'px-1 font-serif text-lg font-bold text-ink';

/**
 * Create / edit form for a sacrament meeting. The Server Action validates with Zod and returns
 * field errors, which appear under each field and are announced by screen readers (aria-live).
 */
export default function MeetingForm({ action, submitLabel, initialValues = {}, cancelHref = '/meetings' }: MeetingFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialMeetingFormState);

  // Unique ids per form: Next.js keeps recently visited pages mounted (hidden) for instant back
  // navigation, so fixed ids like "date" could exist twice and labels would point at the hidden copy.
  const uid = useId();
  const fid = (name: string) => `${uid}-${name}`;

  // After a failed submit, show what the user typed rather than the original values.
  const values: MeetingFormValues = state.values ?? initialValues;
  const errors = state.errors;

  /** Props shared by every text-like input: id, name, saved value and the ARIA error wiring. */
  const field = (name: string, hint = false) => ({
    id: fid(name),
    name,
    defaultValue: values[name] ?? '',
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': [hint ? fid(`${name}-hint`) : null, fid(`${name}-error`)].filter(Boolean).join(' '),
  });

  const errorFor = (name: string) => <FieldError id={fid(`${name}-error`)} messages={errors[name]} />;

  return (
    <form action={formAction} noValidate aria-describedby={fid('form-message')} className="space-y-6">
      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Meeting details</legend>
        <div className="mt-2 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={fid('date')} className={labelClass}>
              Date
            </label>
            <input type="date" required className={inputClass} {...field('date', true)} />
            <p id={fid('date-hint')} className="mt-1 text-sm text-muted">
              Must be a Sunday.
            </p>
            {errorFor('date')}
          </div>
          <div>
            <label htmlFor={fid('meetingType')} className={labelClass}>
              Meeting type
            </label>
            <select required className={inputClass} {...field('meetingType', true)} defaultValue={values.meetingType ?? 'regular'}>
              {MEETING_TYPES.map((type) => (
                <option key={type} value={type}>
                  {MEETING_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            <p id={fid('meetingType-hint')} className="mt-1 text-sm text-muted">
              Stake and General Conference Sundays don&apos;t need a sacrament hymn.
            </p>
            {errorFor('meetingType')}
          </div>
          <div>
            <label htmlFor={fid('presiding')} className={labelClass}>
              Presiding
            </label>
            <input type="text" required maxLength={255} className={inputClass} {...field('presiding')} />
            {errorFor('presiding')}
          </div>
          <div>
            <label htmlFor={fid('conducting')} className={labelClass}>
              Conducting
            </label>
            <input type="text" required maxLength={255} className={inputClass} {...field('conducting')} />
            {errorFor('conducting')}
          </div>
        </div>
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Hymns and prayers</legend>
        <div className="mt-2 space-y-4">
          <HymnRow label="Opening hymn" name="openingHymn" field={field} errorFor={errorFor} fid={fid} />
          <div>
            <label htmlFor={fid('openingPrayer')} className={labelClass}>
              Opening prayer
            </label>
            <input type="text" required maxLength={255} className={inputClass} {...field('openingPrayer')} />
            {errorFor('openingPrayer')}
          </div>
          <HymnRow label="Sacrament hymn" name="sacramentHymn" field={field} errorFor={errorFor} fid={fid} />
          <HymnRow label="Closing hymn" name="closingHymn" field={field} errorFor={errorFor} fid={fid} />
          <div>
            <label htmlFor={fid('closingPrayer')} className={labelClass}>
              Closing prayer
            </label>
            <input type="text" required maxLength={255} className={inputClass} {...field('closingPrayer')} />
            {errorFor('closingPrayer')}
          </div>
        </div>
      </fieldset>

      <fieldset className={fieldsetClass} aria-describedby={`${fid('speakers-hint')} ${fid('speakers-error')}`}>
        <legend className={legendClass}>Speakers and musical numbers</legend>
        <p id={fid('speakers-hint')} className="mt-1 text-sm text-muted">
          Optional. Fill in only the rows you need; empty rows are ignored.
        </p>
        <ol className="mt-4 space-y-4">
          {Array.from({ length: SPEAKER_ROWS }, (_, index) => {
            const row = index + 1;
            return (
              <li key={row} className="grid gap-3 sm:grid-cols-[1fr_1fr_11rem]">
                <div>
                  <label htmlFor={fid(`speaker${row}Name`)} className={labelClass}>
                    Name {row}
                  </label>
                  <input
                    id={fid(`speaker${row}Name`)}
                    name={`speaker${row}Name`}
                    type="text"
                    maxLength={120}
                    defaultValue={values[`speaker${row}Name`] ?? ''}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor={fid(`speaker${row}Topic`)} className={labelClass}>
                    Topic or song {row}
                  </label>
                  <input
                    id={fid(`speaker${row}Topic`)}
                    name={`speaker${row}Topic`}
                    type="text"
                    maxLength={200}
                    defaultValue={values[`speaker${row}Topic`] ?? ''}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor={fid(`speaker${row}Type`)} className={labelClass}>
                    Type {row}
                  </label>
                  <select
                    id={fid(`speaker${row}Type`)}
                    name={`speaker${row}Type`}
                    defaultValue={values[`speaker${row}Type`] ?? 'speaker'}
                    className={inputClass}
                  >
                    <option value="speaker">Speaker</option>
                    <option value="musical-number">Musical number</option>
                  </select>
                </div>
              </li>
            );
          })}
        </ol>
        {errorFor('speakers')}
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Announcements and business</legend>
        <div className="mt-2 space-y-4">
          <div>
            <label htmlFor={fid('announcements')} className={labelClass}>
              Announcements
            </label>
            <textarea rows={3} className={inputClass} {...field('announcements', true)} />
            <p id={fid('announcements-hint')} className="mt-1 text-sm text-muted">
              Optional. One announcement per line.
            </p>
            {errorFor('announcements')}
          </div>
          <div>
            <label htmlFor={fid('wardBusiness')} className={labelClass}>
              Ward business
            </label>
            <textarea rows={3} className={inputClass} {...field('wardBusiness', true)} />
            <p id={fid('wardBusiness-hint')} className="mt-1 text-sm text-muted">
              Optional. One item per line, such as a release or sustaining.
            </p>
            {errorFor('wardBusiness')}
          </div>
          <div className="flex items-center gap-2">
            <input
              id={fid('stakeBusiness')}
              name="stakeBusiness"
              type="checkbox"
              defaultChecked={values.stakeBusiness === 'on'}
              className="h-4 w-4 accent-brand"
            />
            <label htmlFor={fid('stakeBusiness')} className="text-sm font-semibold text-ink">
              Stake business will be presented
            </label>
          </div>
        </div>
      </fieldset>

      {/* Form-level message, e.g. "Please fix the highlighted fields" or a database error. */}
      <div id={fid('form-message')} aria-live="polite" aria-atomic="true">
        {state.message && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">{state.message}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Saving…' : submitLabel}
        </button>
        <Link href={cancelHref} className="font-semibold text-brand hover:underline">
          Cancel
        </Link>
      </div>
    </form>
  );
}

type FieldProps = (name: string, hint?: boolean) => {
  id: string;
  name: string;
  defaultValue: string;
  'aria-invalid': boolean | undefined;
  'aria-describedby': string;
};

interface HymnRowProps {
  label: string;
  name: 'openingHymn' | 'sacramentHymn' | 'closingHymn';
  field: FieldProps;
  errorFor: (name: string) => React.ReactNode;
  fid: (name: string) => string;
}

/** Hymn number + title side by side. */
function HymnRow({ label, name, field, errorFor, fid }: HymnRowProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-[9rem_1fr]">
      <div>
        <label htmlFor={fid(`${name}Number`)} className={labelClass}>
          {label} number
        </label>
        <input type="number" inputMode="numeric" min={1} max={1999} className={inputClass} {...field(`${name}Number`)} />
        {errorFor(`${name}Number`)}
      </div>
      <div>
        <label htmlFor={fid(`${name}Title`)} className={labelClass}>
          {label} title
        </label>
        <input type="text" maxLength={120} className={inputClass} {...field(`${name}Title`)} />
        {errorFor(`${name}Title`)}
      </div>
    </div>
  );
}

/** Error container that is always in the page, so screen readers announce new messages. */
function FieldError({ id, messages }: { id: string; messages?: string[] }) {
  return (
    <div id={id} aria-live="polite" aria-atomic="true" className="mt-1 text-sm text-red-700">
      {messages?.map((message) => (
        <p key={message}>{message}</p>
      ))}
    </div>
  );
}
