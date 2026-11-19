import { neon } from '@neondatabase/serverless';
import type { SacramentMeeting } from './types';

// Meetings now live in a Neon (serverless PostgreSQL) database provisioned through Vercel.
// The connection string comes from DATABASE_URL (pulled into .env.local with `vercel env pull`).
// Every query uses the sql tagged template, which sends ${values} as query parameters,
// so user input can never change the SQL itself.
const sql = neon(process.env.DATABASE_URL!);

export const ITEMS_PER_PAGE = 5;

/*
 * The table uses snake_case columns; these aliases return rows in the camelCase shape of
 * SacramentMeeting. to_char keeps the date as 'YYYY-MM-DD' text (a DATE would otherwise
 * arrive as a JavaScript Date in UTC), and COALESCE turns a NULL list into an empty one.
 * The columns are written out in each query because the tagged template only accepts values,
 * not SQL fragments.
 */

/** ILIKE pattern that matches the search text anywhere, treating a typed % or _ literally. */
function toSearchPattern(query: string): string {
  return `%${query.trim().replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;
}

/**
 * One page of meetings, newest first. The query matches the presiding or conducting leader,
 * the meeting type, or any speaker or musical number (name or topic), ignoring case.
 * An empty query matches every meeting.
 */
export async function getMeetings(query: string = '', currentPage: number = 1): Promise<SacramentMeeting[]> {
  const pattern = toSearchPattern(query);
  const page = Number.isInteger(currentPage) && currentPage > 0 ? currentPage : 1;
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const rows = await sql`
    SELECT
      id,
      to_char(date, 'YYYY-MM-DD')      AS "date",
      meeting_type                     AS "meetingType",
      presiding,
      conducting,
      COALESCE(announcements, '{}')    AS announcements,
      opening_hymn                     AS "openingHymn",
      opening_prayer                   AS "openingPrayer",
      COALESCE(ward_business, '[]')    AS "wardBusiness",
      COALESCE(stake_business, false)  AS "stakeBusiness",
      sacrament_hymn                   AS "sacramentHymn",
      COALESCE(speakers, '[]')         AS speakers,
      closing_hymn                     AS "closingHymn",
      closing_prayer                   AS "closingPrayer"
    FROM meetings
    WHERE presiding ILIKE ${pattern}
       OR conducting ILIKE ${pattern}
       OR meeting_type ILIKE ${pattern}
       OR speakers::text ILIKE ${pattern}
    ORDER BY date DESC
    LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}`;

  return rows as SacramentMeeting[];
}

/** Number of pages of results for the query (0 when nothing matches). */
export async function getMeetingsTotalPages(query: string = ''): Promise<number> {
  const pattern = toSearchPattern(query);

  const rows = await sql`
    SELECT COUNT(*) AS count
    FROM meetings
    WHERE presiding ILIKE ${pattern}
       OR conducting ILIKE ${pattern}
       OR meeting_type ILIKE ${pattern}
       OR speakers::text ILIKE ${pattern}`;

  return Math.ceil(Number(rows[0].count) / ITEMS_PER_PAGE);
}

/** One meeting by id, or null if there is no such meeting. */
export async function getMeetingById(id: number): Promise<SacramentMeeting | null> {
  // Ids larger than PostgreSQL's INTEGER range can't exist (and would make the query fail).
  if (!Number.isInteger(id) || id <= 0 || id > 2147483647) return null;

  const rows = await sql`
    SELECT
      id,
      to_char(date, 'YYYY-MM-DD')      AS "date",
      meeting_type                     AS "meetingType",
      presiding,
      conducting,
      COALESCE(announcements, '{}')    AS announcements,
      opening_hymn                     AS "openingHymn",
      opening_prayer                   AS "openingPrayer",
      COALESCE(ward_business, '[]')    AS "wardBusiness",
      COALESCE(stake_business, false)  AS "stakeBusiness",
      sacrament_hymn                   AS "sacramentHymn",
      COALESCE(speakers, '[]')         AS speakers,
      closing_hymn                     AS "closingHymn",
      closing_prayer                   AS "closingPrayer"
    FROM meetings
    WHERE id = ${id}`;

  return (rows[0] as SacramentMeeting | undefined) ?? null;
}

/**
 * Meetings held on one date ('YYYY-MM-DD'). Used by GET /api/meetings?date= and by
 * /meetings/current. The date column is UNIQUE, so the list has at most one meeting.
 */
export async function getMeetingsByDate(date: string): Promise<SacramentMeeting[]> {
  const rows = await sql`
    SELECT
      id,
      to_char(date, 'YYYY-MM-DD')      AS "date",
      meeting_type                     AS "meetingType",
      presiding,
      conducting,
      COALESCE(announcements, '{}')    AS announcements,
      opening_hymn                     AS "openingHymn",
      opening_prayer                   AS "openingPrayer",
      COALESCE(ward_business, '[]')    AS "wardBusiness",
      COALESCE(stake_business, false)  AS "stakeBusiness",
      sacrament_hymn                   AS "sacramentHymn",
      COALESCE(speakers, '[]')         AS speakers,
      closing_hymn                     AS "closingHymn",
      closing_prayer                   AS "closingPrayer"
    FROM meetings
    WHERE date = ${date}::date`;

  return rows as SacramentMeeting[];
}

// ---------- Write operations (called by the Server Actions in lib/actions.ts) ----------

/** Everything about a meeting except its database id. */
export type MeetingInput = Omit<SacramentMeeting, 'id'>;

/** True when a database error is a duplicate value in a UNIQUE column (Postgres code 23505). */
export function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
}

/** Inserts a meeting and returns its new id. Throws on a duplicate date (see isUniqueViolation). */
export async function addMeeting(input: MeetingInput): Promise<number> {
  // JSON columns are sent as JSON text and cast with ::jsonb; TEXT[] values are sent as arrays.
  const rows = await sql`
    INSERT INTO meetings (
      date, meeting_type, presiding, conducting, announcements,
      opening_hymn, opening_prayer, ward_business, stake_business,
      sacrament_hymn, speakers, closing_hymn, closing_prayer
    ) VALUES (
      ${input.date}::date, ${input.meetingType}, ${input.presiding}, ${input.conducting},
      ${input.announcements ?? []},
      ${JSON.stringify(input.openingHymn)}::jsonb, ${input.openingPrayer},
      ${JSON.stringify(input.wardBusiness)}::jsonb, ${input.stakeBusiness},
      ${JSON.stringify(input.sacramentHymn)}::jsonb, ${JSON.stringify(input.speakers)}::jsonb,
      ${JSON.stringify(input.closingHymn)}::jsonb, ${input.closingPrayer}
    )
    RETURNING id`;

  return Number(rows[0].id);
}

/** Replaces a meeting's details. Returns false if no meeting has that id. */
export async function updateMeeting(id: number, input: MeetingInput): Promise<boolean> {
  if (!Number.isInteger(id) || id <= 0 || id > 2147483647) return false;

  const rows = await sql`
    UPDATE meetings SET
      date = ${input.date}::date,
      meeting_type = ${input.meetingType},
      presiding = ${input.presiding},
      conducting = ${input.conducting},
      announcements = ${input.announcements ?? []},
      opening_hymn = ${JSON.stringify(input.openingHymn)}::jsonb,
      opening_prayer = ${input.openingPrayer},
      ward_business = ${JSON.stringify(input.wardBusiness)}::jsonb,
      stake_business = ${input.stakeBusiness},
      sacrament_hymn = ${JSON.stringify(input.sacramentHymn)}::jsonb,
      speakers = ${JSON.stringify(input.speakers)}::jsonb,
      closing_hymn = ${JSON.stringify(input.closingHymn)}::jsonb,
      closing_prayer = ${input.closingPrayer}
    WHERE id = ${id}
    RETURNING id`;

  return rows.length > 0;
}

/** Deletes a meeting. Returns false if no meeting has that id. */
export async function deleteMeeting(id: number): Promise<boolean> {
  if (!Number.isInteger(id) || id <= 0 || id > 2147483647) return false;

  const rows = await sql`DELETE FROM meetings WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}
