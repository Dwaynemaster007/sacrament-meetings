import type { MeetingType } from '@/lib/types';
import { MEETING_TYPE_LABELS } from '@/lib/meeting-utils';

interface MeetingTypeBadgeProps {
  type: MeetingType;
}

const colors: Record<MeetingType, string> = {
  regular: 'bg-blue-50 text-brand border-blue-200',
  testimony: 'bg-accent-soft text-accent border-amber-200',
  stake: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  general: 'bg-purple-50 text-purple-800 border-purple-200',
  special: 'bg-rose-50 text-rose-800 border-rose-200',
};

export default function MeetingTypeBadge({ type }: MeetingTypeBadgeProps) {
  return (
    <span
      className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold print:border-black print:text-black ${colors[type]}`}
    >
      {MEETING_TYPE_LABELS[type]}
    </span>
  );
}
