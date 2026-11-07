import Link from 'next/link';

export default function MeetingNotFound() {
  return (
    <div className="rounded-xl border border-line bg-card p-8 text-center">
      <h1 className="font-serif text-2xl font-bold text-ink">Meeting not found</h1>
      <p className="mt-2 text-muted">There is no meeting program with that id.</p>
      <Link href="/meetings" className="mt-4 inline-block font-semibold text-brand hover:underline">
        View all meetings
      </Link>
    </div>
  );
}
