import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MeetingForm from '@/components/MeetingForm';
import { updateMeeting } from '@/lib/actions';
import { getMeetingById } from '@/lib/meetings-db';
import { meetingToFormValues } from '@/lib/meeting-form';
import { formatMeetingDate } from '@/lib/meeting-utils';

export const metadata: Metadata = { title: 'Edit meeting' };

type Params = Promise<{ id: string }>;

async function EditMeeting({ params }: { params: Params }) {
  const { id } = await params;
  // Only digits count as an id; anything else shows the not-found page without a database call.
  const meeting = /^\d+$/.test(id) ? await getMeetingById(Number(id)) : null;
  if (!meeting) notFound();

  // bind() fixes the first argument, so the action knows which meeting to update.
  const updateWithId = updateMeeting.bind(null, id);

  return (
    <>
      <p className="mt-2 mb-8 text-muted">{formatMeetingDate(meeting.date)}</p>
      <MeetingForm
        action={updateWithId}
        submitLabel="Save changes"
        initialValues={meetingToFormValues(meeting)}
        cancelHref={`/meetings/${meeting.id}`}
      />
    </>
  );
}

export default function EditMeetingPage({ params }: { params: Params }) {
  return (
    <>
      <h1 className="font-serif text-3xl font-bold text-ink">Edit meeting</h1>
      <Suspense fallback={<p className="mt-4 text-muted">Loading meeting…</p>}>
        <EditMeeting params={params} />
      </Suspense>
    </>
  );
}
