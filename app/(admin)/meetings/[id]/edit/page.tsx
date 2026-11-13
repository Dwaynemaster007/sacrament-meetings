import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Edit meeting' };

export default function EditMeetingPage() {
  return (
    <>
      <h1 className="font-serif text-3xl font-bold text-ink">Edit Meeting — Coming in Week 04</h1>
      <p className="mt-3 text-muted">Leaders will update a planned meeting&apos;s program here.</p>
    </>
  );
}
