import type { Metadata } from 'next';
import MeetingCard from '@/components/MeetingCard';
import { fetchMeetings } from '@/lib/api';
import { getMostRecentSunday } from '@/lib/meeting-utils';

export const metadata: Metadata = { title: 'All meetings' };

export default async function MeetingsPage() {
  const meetings = await fetchMeetings();
  const thisSunday = getMostRecentSunday();

  return (
    <>
      <h1 className="font-serif text-3xl font-bold text-ink">Sacrament meetings</h1>
      <p className="mt-2 text-muted">
        Select a Sunday to view its full program. Upcoming and past meetings are listed newest first.
      </p>

      {meetings.length === 0 ? (
        <p className="mt-8 rounded-lg border border-line bg-card p-6 text-muted">No meetings have been planned yet.</p>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => (
            <li key={meeting.id}>
              <MeetingCard meeting={meeting} isCurrent={meeting.date === thisSunday} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
