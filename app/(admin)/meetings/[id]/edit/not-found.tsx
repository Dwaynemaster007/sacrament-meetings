import Link from 'next/link';

export default function MeetingNotFound() {
  return (
    <div className="py-6">
      <h2 className="font-serif text-2xl font-bold text-ink">Meeting not found</h2>
      <p className="mt-2 text-muted">That meeting doesn&apos;t exist, or it may have been deleted.</p>
      <Link href="/meetings" className="mt-6 inline-block font-semibold text-brand hover:underline">
        ← Back to all meetings
      </Link>
    </div>
  );
}
