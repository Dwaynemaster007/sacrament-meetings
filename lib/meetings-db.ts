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

// ---------- Write operations (implemented in Week 04 with Server Actions) ----------

export async function addMeeting(data: Omit<SacramentMeeting, 'id'>): Promise<SacramentMeeting> {
  void data;
  throw new Error('addMeeting: database implementation comes in Week 04');
}

export async function updateMeeting(
  id: number,
  updates: Partial<SacramentMeeting>
): Promise<SacramentMeeting | null> {
  void id;
  void updates;
  throw new Error('updateMeeting: database implementation comes in Week 04');
}

export async function deleteMeeting(id: number): Promise<boolean> {
  void id;
  throw new Error('deleteMeeting: database implementation comes in Week 04');
}
