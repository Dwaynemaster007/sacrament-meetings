import type { Hymn, MeetingType } from './types';

export const WARD_NAME = 'Mbabane Ward';

/** Dates such as "today" and "this Sunday" are worked out in the ward's local time zone. */
export const WARD_TIME_ZONE = 'Africa/Mbabane';

export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  testimony: 'Fast & Testimony Meeting',
  regular: 'Sacrament Meeting',
  stake: 'Stake Conference',
  general: 'General Conference',
};

/** Stake and general conference Sundays replace the ward sacrament meeting. */
export function isSacramentMeeting(type: MeetingType): boolean {
  return type === 'testimony' || type === 'regular';
}

/** "#169 · As Now We Take the Sacrament", or just the title when there is no hymn number. */
export function formatHymn(hymn: Hymn): string {
  return hymn.number > 0 ? `#${hymn.number} · ${hymn.title}` : hymn.title;
}

/** Formats an ISO date ('YYYY-MM-DD') as e.g. "Sunday, November 1, 2026" without time-zone drift. */
export function formatMeetingDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/** Today's calendar date in the ward's time zone, as a UTC-midnight Date. */
function wardToday(now: Date): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: WARD_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now); // "YYYY-MM-DD"
  const [y, m, d] = parts.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Returns the most recent Sunday (today if today is Sunday) as 'YYYY-MM-DD'. */
export function getMostRecentSunday(now: Date = new Date()): string {
  const today = wardToday(now);
  const dayOfWeek = today.getUTCDay(); // 0 (Sun) through 6 (Sat)
  const sunday = new Date(today);
  sunday.setUTCDate(today.getUTCDate() - dayOfWeek); // roll back to Sunday
  return sunday.toISOString().slice(0, 10);
}

/** e.g. "Friday, November 6, 2026" in the ward's time zone. */
export function formatToday(now: Date = new Date()): string {
  return now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: WARD_TIME_ZONE,
  });
}
