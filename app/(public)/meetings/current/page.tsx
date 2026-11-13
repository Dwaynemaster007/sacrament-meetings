import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { getMeetingsByDate } from '@/lib/meetings-db';
import { getMostRecentSunday } from '@/lib/meeting-utils';

/** /meetings/current → the most recent Sunday's program, or the full list if none is planned. */
export default async function CurrentMeetingPage() {
  await connection(); // "today" must be worked out per request, not at build time
  const sunday = getMostRecentSunday();
  const [meeting] = await getMeetingsByDate(sunday);

  redirect(meeting ? `/meetings/${meeting.id}` : '/meetings');
}
