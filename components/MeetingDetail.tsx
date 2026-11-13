import type { Hymn, SacramentMeeting } from '@/lib/types';
import {
  WARD_NAME,
  MEETING_TYPE_LABELS,
  formatHymn,
  formatMeetingDate,
  isSacramentMeeting,
} from '@/lib/meeting-utils';
import MeetingTypeBadge from './MeetingTypeBadge';

interface MeetingDetailProps {
  meeting: SacramentMeeting;
}

interface ProgramRowProps {
  label: string;
  children: React.ReactNode;
}

function ProgramRow({ label, children }: ProgramRowProps) {
  return (
    <div className="grid gap-1 border-b border-dotted border-line py-3 last:border-b-0 sm:grid-cols-[12rem_1fr] sm:gap-4 print:grid-cols-[12rem_1fr] print:py-2">
      <dt className="text-sm font-semibold uppercase tracking-wide text-muted print:text-black">{label}</dt>
      <dd className="text-ink">{children}</dd>
    </div>
  );
}

function HymnText({ hymn }: { hymn: Hymn }) {
  return <span className="font-medium">{formatHymn(hymn)}</span>;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-1 mt-6 font-serif text-lg font-bold text-brand first:mt-0 print:text-black">{children}</h2>
  );
}

export default function MeetingDetail({ meeting }: MeetingDetailProps) {
  const sacramentMeeting = isSacramentMeeting(meeting.meetingType);
  const announcements = meeting.announcements ?? [];

  return (
    <article className="rounded-xl border border-line bg-card p-6 shadow-sm sm:p-8 print:border-0 print:p-0 print:shadow-none">
      <header className="mb-6 border-b-2 border-brand pb-4 text-center print:border-black">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted print:text-black">{WARD_NAME}</p>
        <h1 className="mt-1 font-serif text-2xl font-bold text-ink sm:text-3xl">{MEETING_TYPE_LABELS[meeting.meetingType]}</h1>
        <p className="mt-1 text-lg text-muted print:text-black">
          <time dateTime={meeting.date}>{formatMeetingDate(meeting.date)}</time>
        </p>
        <div className="mt-3 print:hidden">
          <MeetingTypeBadge type={meeting.meetingType} />
        </div>
      </header>

      {!sacramentMeeting && (
        <p
          role="note"
          className="mb-6 rounded-lg border border-amber-200 bg-accent-soft p-4 text-sm text-ink print:border-black print:bg-white"
        >
          There is no ward sacrament meeting this Sunday. Members attend the{' '}
          {meeting.meetingType === 'stake' ? 'stake conference' : 'General Conference broadcast'} instead, so the
          sacrament is not administered.
        </p>
      )}

      <SectionHeading>Announcements</SectionHeading>
      {announcements.length > 0 ? (
        <ul className="list-disc space-y-1 pl-6">
          {announcements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-muted">No announcements this week.</p>
      )}

      <SectionHeading>Program</SectionHeading>
      <dl>
        <ProgramRow label="Presiding">{meeting.presiding}</ProgramRow>
        <ProgramRow label="Conducting">{meeting.conducting}</ProgramRow>
        <ProgramRow label="Opening Hymn">
          <HymnText hymn={meeting.openingHymn} />
        </ProgramRow>
        <ProgramRow label="Opening Prayer">{meeting.openingPrayer}</ProgramRow>
        <ProgramRow label="Ward Business">
          {meeting.wardBusiness.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5">
              {meeting.wardBusiness.map((item) => (
                <li key={item.description}>{item.description}</li>
              ))}
            </ul>
          ) : (
            <span className="text-muted">None</span>
          )}
        </ProgramRow>
        <ProgramRow label="Stake Business">{meeting.stakeBusiness ? 'Yes' : 'No'}</ProgramRow>
        <ProgramRow label="Sacrament Hymn">
          <HymnText hymn={meeting.sacramentHymn} />
        </ProgramRow>
        {sacramentMeeting && (
          <ProgramRow label="Sacrament">
            <span className="italic">Administration of the sacrament</span>
          </ProgramRow>
        )}
        <ProgramRow label={meeting.meetingType === 'testimony' ? 'Testimonies' : 'Speakers & Music'}>
          {meeting.speakers.length > 0 ? (
            <ol className="space-y-2">
              {meeting.speakers.map((item, index) => (
                <li key={`${item.name}-${index}`}>
                  {item.type === 'musical-number' ? (
                    <>
                      <span className="mr-2 rounded bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent print:bg-white print:text-black">
                        Musical number
                      </span>
                      <span className="font-medium">{item.name}</span>
                      {item.topic && <span className="text-muted print:text-black">: &ldquo;{item.topic}&rdquo;</span>}
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{item.name}</span>
                      {item.topic && <span className="text-muted print:text-black">: {item.topic}</span>}
                    </>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <span className="text-muted print:text-black">
              {meeting.meetingType === 'testimony' ? 'Testimonies from ward members' : 'To be announced'}
            </span>
          )}
        </ProgramRow>
        <ProgramRow label="Closing Hymn">
          <HymnText hymn={meeting.closingHymn} />
        </ProgramRow>
        <ProgramRow label="Closing Prayer">{meeting.closingPrayer}</ProgramRow>
      </dl>
    </article>
  );
}
