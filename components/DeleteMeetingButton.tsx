'use client';

import { useFormStatus } from 'react-dom';
import { deleteMeeting } from '@/lib/actions';

interface DeleteMeetingButtonProps {
  id: number;
  /** Used in the confirmation and for screen readers, e.g. "Sunday, November 8, 2026". */
  label: string;
  className?: string;
}

function SubmitButton({ label, className }: { label: string; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? 'Deleting…' : 'Delete'}
      <span className="sr-only"> meeting on {label}</span>
    </button>
  );
}

/** A small form that deletes one meeting after the user confirms. bind() passes the id to the action. */
export default function DeleteMeetingButton({
  id,
  label,
  className = 'font-semibold text-red-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:opacity-60',
}: DeleteMeetingButtonProps) {
  const deleteWithId = deleteMeeting.bind(null, String(id));

  return (
    <form
      action={deleteWithId}
      onSubmit={(event) => {
        if (!window.confirm(`Delete the meeting on ${label}? This can't be undone.`)) event.preventDefault();
      }}
    >
      <SubmitButton label={label} className={className} />
    </form>
  );
}
