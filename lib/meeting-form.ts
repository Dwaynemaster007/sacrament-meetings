import type { SacramentMeeting } from '@/lib/types';

// Shared by the Server Actions and the client form. ('use server' files may only export async functions.)

/** How many speaker / musical-number rows the form shows. Empty rows are ignored. */
export const SPEAKER_ROWS = 5;

/** Form field name → value, as strings. */
export type MeetingFormValues = Record<string, string>;

export interface MeetingFormState {
  message: string | null;
  /** Field name → messages. Keys match the form's input names (e.g. "openingHymnNumber"). */
  errors: Record<string, string[]>;
  /** What the user typed, so the form can refill itself after a failed submit. */
  values?: MeetingFormValues;
}

export const initialMeetingFormState: MeetingFormState = { message: null, errors: {} };

/** Turns a saved meeting into form values, for the edit page. */
export function meetingToFormValues(meeting: SacramentMeeting): MeetingFormValues {
  const values: MeetingFormValues = {
    date: meeting.date,
    meetingType: meeting.meetingType,
    presiding: meeting.presiding,
    conducting: meeting.conducting,
    openingPrayer: meeting.openingPrayer,
    closingPrayer: meeting.closingPrayer,
    openingHymnNumber: String(meeting.openingHymn.number),
    openingHymnTitle: meeting.openingHymn.title,
    // Number 0 means "no sacrament administered", so leave those boxes empty.
    sacramentHymnNumber: meeting.sacramentHymn.number > 0 ? String(meeting.sacramentHymn.number) : '',
    sacramentHymnTitle: meeting.sacramentHymn.number > 0 ? meeting.sacramentHymn.title : '',
    closingHymnNumber: String(meeting.closingHymn.number),
    closingHymnTitle: meeting.closingHymn.title,
    announcements: (meeting.announcements ?? []).join('\n'),
    wardBusiness: meeting.wardBusiness.map((item) => item.description).join('\n'),
    stakeBusiness: meeting.stakeBusiness ? 'on' : '',
  };

  meeting.speakers.slice(0, SPEAKER_ROWS).forEach((speaker, index) => {
    const row = index + 1;
    values[`speaker${row}Name`] = speaker.name;
    values[`speaker${row}Topic`] = speaker.topic;
    values[`speaker${row}Type`] = speaker.type;
  });

  return values;
}
