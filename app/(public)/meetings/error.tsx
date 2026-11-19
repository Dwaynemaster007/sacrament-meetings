'use client'; // Error boundaries must be Client Components

import MeetingsError, { type MeetingsErrorProps } from '@/components/MeetingsError';

/** Catches unexpected errors under /meetings, such as a failed delete or an unreachable database. */
export default function MeetingsErrorBoundary(props: MeetingsErrorProps) {
  return <MeetingsError {...props} />;
}
