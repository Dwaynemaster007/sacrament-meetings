import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Create meeting' };

export default function NewMeetingPage() {
  return (
    <>
      <h1 className="font-serif text-3xl font-bold text-ink">Create Meeting — Coming in Week 04</h1>
      <p className="mt-3 text-muted">
        Leaders will plan a new sacrament meeting here: date, meeting type, prayers, hymns, ward business and speakers.
      </p>
    </>
  );
}
