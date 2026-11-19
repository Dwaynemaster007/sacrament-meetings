'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import * as db from '@/lib/meetings-db';
import type { MeetingType, SpeakerItem } from '@/lib/types';
import { SPEAKER_ROWS, type MeetingFormState, type MeetingFormValues } from '@/lib/meeting-form';

// ---------- Validation ----------

const required = (label: string, max = 255) =>
  z
    .string()
    .trim()
    .min(1, { error: `Enter ${label}.` })
    .max(max, { error: `${label[0].toUpperCase()}${label.slice(1)} must be ${max} characters or fewer.` });

const hymnNumber = z
  .string()
  .trim()
  .min(1, { error: 'Enter the hymn number.' })
  .pipe(
    z.coerce
      .number<string>({ error: 'Enter the hymn number as a number.' })
      .int({ error: 'Enter a whole hymn number.' })
      .min(1, { error: 'Hymn numbers start at 1.' })
      .max(1999, { error: 'Enter a hymn number below 2000.' })
  );

const hymnTitle = required('the hymn title', 120);

/** "Line one\nLine two" → ['Line one', 'Line two'] (blank lines dropped). */
const lines = z
  .string()
  .transform((value) =>
    value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
  )
  .pipe(z.array(z.string().max(300, { error: 'Keep each line under 300 characters.' })).max(20, {
    error: 'Enter 20 lines or fewer.',
  }));

const MeetingFormSchema = z
  .object({
    // abort: stop at the first problem, so an empty date doesn't also say "choose a Sunday".
    date: z.iso
      .date({ error: 'Enter a valid date.', abort: true })
      .refine((value) => new Date(`${value}T00:00:00Z`).getUTCDay() === 0, {
        error: 'Sacrament meetings are held on Sundays. Choose a Sunday.',
      }),
    meetingType: z.enum(['regular', 'testimony', 'stake', 'general', 'special'], {
      error: 'Choose a meeting type.',
    }),
    presiding: required('who is presiding'),
    conducting: required('who is conducting'),
    openingPrayer: required('who gives the opening prayer'),
    closingPrayer: required('who gives the closing prayer'),
    openingHymnNumber: hymnNumber,
    openingHymnTitle: hymnTitle,
    // The sacrament hymn may be left blank on stake or general conference Sundays.
    sacramentHymnNumber: z.string().trim(),
    sacramentHymnTitle: z.string().trim().max(120),
    closingHymnNumber: hymnNumber,
    closingHymnTitle: hymnTitle,
    announcements: lines,
    wardBusiness: lines,
    stakeBusiness: z.boolean(),
  });

/** Reads every form field as a string (checkboxes become "on" or ""). */
function readForm(formData: FormData): MeetingFormValues {
  const values: MeetingFormValues = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string' && !key.startsWith('$')) values[key] = value;
  }
  return values;
}

/**
 * The sacrament hymn is required except on stake and General Conference Sundays. Checked outside
 * the schema so its message appears together with every other field error.
 */
function checkSacramentHymn(values: MeetingFormValues): Record<string, string[]> {
  if (values.meetingType === 'stake' || values.meetingType === 'general') return {};

  const errors: Record<string, string[]> = {};
  const raw = (values.sacramentHymnNumber ?? '').trim();
  const number = Number(raw);
  if (!raw) errors.sacramentHymnNumber = ['Enter the sacrament hymn number.'];
  else if (!Number.isInteger(number) || number < 1 || number > 1999) {
    errors.sacramentHymnNumber = ['Enter a whole hymn number from 1 to 1999.'];
  }
  if (!(values.sacramentHymnTitle ?? '').trim()) errors.sacramentHymnTitle = ['Enter the sacrament hymn title.'];
  return errors;
}

/** Turns the speaker rows into SpeakerItems, reporting rows that are only half filled in. */
function readSpeakers(values: MeetingFormValues): { speakers: SpeakerItem[]; errors: string[] } {
  const speakers: SpeakerItem[] = [];
  const errors: string[] = [];

  for (let row = 1; row <= SPEAKER_ROWS; row++) {
    const name = (values[`speaker${row}Name`] ?? '').trim();
    const topic = (values[`speaker${row}Topic`] ?? '').trim();
    const type = values[`speaker${row}Type`] === 'musical-number' ? 'musical-number' : 'speaker';

    if (!name && !topic) continue;
    if (!name) errors.push(`Row ${row}: enter the name.`);
    else if (!topic) errors.push(`Row ${row}: enter the ${type === 'speaker' ? 'topic' : 'song title'}.`);
    else if (name.length > 120 || topic.length > 200) errors.push(`Row ${row}: shorten the name or topic.`);
    else speakers.push({ name, topic, type });
  }

  return { speakers, errors };
}

/** Validates the form; returns either a clean MeetingInput or a state describing what to fix. */
function validate(formData: FormData): { input: db.MeetingInput } | { state: MeetingFormState } {
  const values = readForm(formData);
  const result = MeetingFormSchema.safeParse({
    date: values.date ?? '',
    meetingType: values.meetingType ?? '',
    presiding: values.presiding ?? '',
    conducting: values.conducting ?? '',
    openingPrayer: values.openingPrayer ?? '',
    closingPrayer: values.closingPrayer ?? '',
    openingHymnNumber: values.openingHymnNumber ?? '',
    openingHymnTitle: values.openingHymnTitle ?? '',
    sacramentHymnNumber: values.sacramentHymnNumber ?? '',
    sacramentHymnTitle: values.sacramentHymnTitle ?? '',
    closingHymnNumber: values.closingHymnNumber ?? '',
    closingHymnTitle: values.closingHymnTitle ?? '',
    announcements: values.announcements ?? '',
    wardBusiness: values.wardBusiness ?? '',
    stakeBusiness: values.stakeBusiness === 'on',
  });
  const { speakers, errors: speakerErrors } = readSpeakers(values);
  const sacramentErrors = checkSacramentHymn(values);

  if (!result.success || speakerErrors.length > 0 || Object.keys(sacramentErrors).length > 0) {
    const errors: Record<string, string[]> = {
      ...(result.success ? {} : (z.flattenError(result.error).fieldErrors as Record<string, string[]>)),
      ...sacramentErrors,
    };
    if (speakerErrors.length > 0) errors.speakers = speakerErrors;
    return {
      state: { message: 'Please fix the highlighted fields and try again.', errors, values },
    };
  }

  const data = result.data;
  const noSacrament = data.meetingType === 'stake' || data.meetingType === 'general';

  return {
    input: {
      date: data.date,
      meetingType: data.meetingType as MeetingType,
      presiding: data.presiding,
      conducting: data.conducting,
      announcements: data.announcements,
      openingHymn: { number: data.openingHymnNumber, title: data.openingHymnTitle },
      openingPrayer: data.openingPrayer,
      wardBusiness: data.wardBusiness.map((description) => ({ description })),
      stakeBusiness: data.stakeBusiness,
      sacramentHymn:
        noSacrament && !data.sacramentHymnNumber
          ? { number: 0, title: 'No sacrament administered' }
          : { number: Number(data.sacramentHymnNumber), title: data.sacramentHymnTitle },
      speakers,
      closingHymn: { number: data.closingHymnNumber, title: data.closingHymnTitle },
      closingPrayer: data.closingPrayer,
    },
  };
}

/** Accepts only positive whole-number ids. */
function parseId(id: string): number | null {
  return /^\d+$/.test(id) && Number(id) > 0 && Number(id) <= 2147483647 ? Number(id) : null;
}

/** The state returned when saving fails, keeping what the user typed. */
function saveFailed(error: unknown, formData: FormData, action: string): MeetingFormState {
  if (db.isUniqueViolation(error)) {
    return {
      message: 'Please fix the highlighted fields and try again.',
      errors: { date: ['A meeting is already planned for this date.'] },
      values: readForm(formData),
    };
  }
  console.error(`${action} failed:`, error);
  return {
    message: 'Database error: the meeting could not be saved. Please try again.',
    errors: {},
    values: readForm(formData),
  };
}

// ---------- Server Actions ----------

export async function createMeeting(
  _prevState: MeetingFormState,
  formData: FormData
): Promise<MeetingFormState> {
  const checked = validate(formData);
  if ('state' in checked) return checked.state;

  try {
    await db.addMeeting(checked.input);
  } catch (error) {
    return saveFailed(error, formData, 'createMeeting');
  }

  // Outside try/catch: redirect() works by throwing, so a catch block would swallow it.
  revalidatePath('/meetings');
  redirect('/meetings');
}

export async function updateMeeting(
  id: string,
  _prevState: MeetingFormState,
  formData: FormData
): Promise<MeetingFormState> {
  const meetingId = parseId(id);
  if (meetingId === null) return { message: 'That meeting does not exist.', errors: {} };

  const checked = validate(formData);
  if ('state' in checked) return checked.state;

  try {
    const updated = await db.updateMeeting(meetingId, checked.input);
    if (!updated) return { message: 'That meeting no longer exists.', errors: {} };
  } catch (error) {
    return saveFailed(error, formData, 'updateMeeting');
  }

  revalidatePath('/meetings');
  revalidatePath(`/meetings/${meetingId}`);
  redirect(`/meetings/${meetingId}`);
}

export async function deleteMeeting(id: string): Promise<void> {
  const meetingId = parseId(id);
  if (meetingId === null) throw new Error('Invalid meeting id.');

  try {
    await db.deleteMeeting(meetingId);
  } catch (error) {
    console.error('deleteMeeting failed:', error);
    // Shown by the error.tsx boundary, which offers "Try again" and a link back to /meetings.
    throw new Error('The meeting could not be deleted. Please try again.');
  }

  revalidatePath('/meetings');
  redirect('/meetings');
}
