import Link from 'next/link';
import type { SacramentMeeting } from '@/lib/types';
import { formatHymn, formatMeetingDate, isSacramentMeeting } from '@/lib/meeting-utils';
import MeetingTypeBadge from './MeetingTypeBadge';

interface MeetingCardProps {
  meeting: SacramentMeeting;
  isCurrent?: boolean;
}

export default function MeetingCard({ meeting, isCurrent = false }: MeetingCardProps) {
  const speakerCount = meeting.speakers.filter((s) => s.type === 'speaker').length;
  const musicCount = meeting.speakers.length - speakerCount;

  let summary: string;
  if (!isSacramentMeeting(meeting.meetingType)) {
    summary = 'No ward sacrament meeting';
  } else if (meeting.meetingType === 'testimony') {
    summary = 'Testimonies from ward members';
  } else {
    summary = `${speakerCount} speaker${speakerCount === 1 ? '' : 's'}${
      musicCount > 0 ? `, ${musicCount} musical number${musicCount === 1 ? '' : 's'}` : ''
    }`;
  }

  return (
    <article
      className={`relative flex h-full flex-col rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md focus-within:ring-2 focus-within:ring-brand ${
        isCurrent ? 'border-brand ring-1 ring-brand' : 'border-line'
      }`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <MeetingTypeBadge type={meeting.meetingType} />
        {isCurrent && (
          <span className="rounded-full bg-brand px-3 py-0.5 text-xs font-semibold text-white">This Sunday</span>
        )}
      </div>
      <h2 className="font-serif text-lg font-bold text-ink">
        {/* The stretched link makes the whole card clickable while keeping one accessible link name. */}
        <Link href={`/meetings/${meeting.id}`} className="after:absolute after:inset-0 focus:outline-none">
          {formatMeetingDate(meeting.date)}
        </Link>
      </h2>
      <dl className="mt-3 space-y-1 text-sm text-muted">
        <div>
          <dt className="inline font-semibold text-ink">Conducting: </dt>
          <dd className="inline">{meeting.conducting}</dd>
        </div>
        <div>
          <dt className="inline font-semibold text-ink">Opening hymn: </dt>
          <dd className="inline">{formatHymn(meeting.openingHymn)}</dd>
        </div>
      </dl>
      <p className="mt-auto pt-4 text-sm font-medium text-brand">{summary} →</p>
    </article>
  );
}
