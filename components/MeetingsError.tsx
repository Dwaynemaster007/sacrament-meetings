'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export interface MeetingsErrorProps {
  error: Error & { digest?: string };
  /** Re-fetches and re-renders the segment (current Next.js name). */
  retry?: () => void;
  /** Older name for the same idea, used in the course materials. */
  reset?: () => void;
}

/** Shared body of the error.tsx boundaries under /meetings. */
export default function MeetingsError({ error, retry, reset }: MeetingsErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6">
      <h2 className="font-serif text-2xl font-bold text-red-800">Something went wrong</h2>
      <p className="mt-2 text-ink">
        We couldn&apos;t complete that request. Please try again in a moment.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => (retry ?? reset)?.()}
          className="rounded-lg bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          Try Again
        </button>
        <Link href="/meetings" className="font-semibold text-brand hover:underline">
          Back to all meetings
        </Link>
      </div>
    </div>
  );
}
