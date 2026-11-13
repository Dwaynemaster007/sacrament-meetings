import type { Metadata } from 'next';
import Link from 'next/link';
import MeetingCard from '@/components/MeetingCard';
import MeetingSearch from '@/components/MeetingSearch';
import Pagination from '@/components/Pagination';
import { getMeetings, getMeetingsTotalPages } from '@/lib/meetings-db';
import { getMostRecentSunday } from '@/lib/meeting-utils';

export const metadata: Metadata = { title: 'All meetings' };

interface MeetingsPageProps {
  searchParams: Promise<{ query?: string; page?: string }>;
}

export default async function MeetingsPage({ searchParams }: MeetingsPageProps) {
  const params = await searchParams;
  const query = (params.query ?? '').slice(0, 100);
  const parsedPage = Number(params.page);
  // Anything that isn't a positive whole number (e.g. ?page=abc or ?page=-2) means page 1.
  const currentPage = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  // Both queries are independent, so run them at the same time.
  const [meetings, totalPages] = await Promise.all([
    getMeetings(query, currentPage),
    getMeetingsTotalPages(query),
  ]);
  const thisSunday = getMostRecentSunday();

  return (
    <>
      <h1 className="font-serif text-3xl font-bold text-ink">Sacrament meetings</h1>
      <p className="mt-2 text-muted">
        Select a Sunday to view its full program. Meetings are listed newest first.
      </p>

      <MeetingSearch />

      {meetings.length === 0 ? (
        <div className="mt-8 rounded-lg border border-line bg-card p-6 text-muted">
          {query ? (
            <p>
              No meetings match &ldquo;{query}&rdquo;. Try a speaker&apos;s name, a leader, or a type such as
              &ldquo;testimony&rdquo;.
            </p>
          ) : totalPages > 0 ? (
            <p>
              There is no page {currentPage}.{' '}
              <Link href="/meetings" className="font-semibold text-brand hover:underline">
                Go to the first page
              </Link>
            </p>
          ) : (
            <p>No meetings have been planned yet.</p>
          )}
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meetings.map((meeting) => (
            <li key={meeting.id}>
              <MeetingCard meeting={meeting} isCurrent={meeting.date === thisSunday} />
            </li>
          ))}
        </ul>
      )}

      <Pagination totalPages={totalPages} />
    </>
  );
}
