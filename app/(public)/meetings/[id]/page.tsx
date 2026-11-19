import Link from 'next/link';
import { notFound } from 'next/navigation';
import MeetingDetail from '@/components/MeetingDetail';
import PrintButton from '@/components/PrintButton';
import DeleteMeetingButton from '@/components/DeleteMeetingButton';
import { formatMeetingDate } from '@/lib/meeting-utils';
import { getMeetingById } from '@/lib/meetings-db';

interface MeetingPageProps {
  params: Promise<{ id: string }>;
}

export default async function MeetingPage({ params }: MeetingPageProps) {
  const { id } = await params;
  // Only digits count as an id; "abc" or "1.5" show the not-found page without a database call.
  const meeting = /^\d+$/.test(id) ? await getMeetingById(Number(id)) : null;

  if (!meeting) notFound();

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link href="/meetings" className="text-sm font-semibold text-brand hover:underline">
          ← Back to all meetings
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/meetings/${meeting.id}/edit`}
            className="rounded-lg border border-brand px-4 py-2 text-sm font-semibold text-brand hover:bg-brand hover:text-white"
          >
            Edit
          </Link>
          <DeleteMeetingButton
            id={meeting.id}
            label={formatMeetingDate(meeting.date)}
            className="rounded-lg border border-red-700 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-700 hover:text-white disabled:opacity-60"
          />
          <PrintButton />
        </div>
      </div>
      <MeetingDetail meeting={meeting} />
    </>
  );
}
