import type { Metadata } from 'next';
import MeetingForm from '@/components/MeetingForm';
import { createMeeting } from '@/lib/actions';

export const metadata: Metadata = { title: 'Plan a meeting' };

export default function NewMeetingPage() {
  return (
    <>
      <h1 className="font-serif text-3xl font-bold text-ink">Plan a meeting</h1>
      <p className="mt-2 mb-8 text-muted">Fill in the program for a Sunday sacrament meeting.</p>
      <MeetingForm action={createMeeting} submitLabel="Save meeting" />
    </>
  );
}
