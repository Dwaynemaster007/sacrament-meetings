import { NextResponse, type NextRequest } from 'next/server';
import { getMeetings, getMeetingsByDate } from '@/lib/meetings-db';
import type { ApiError, SacramentMeeting } from '@/lib/types';

/** True for a real calendar date in 'YYYY-MM-DD' form (rejects e.g. 2026-02-30). */
function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// GET /api/meetings                     → first page of meetings (newest first)
// GET /api/meetings?query=smith&page=2  → search and pagination, same as the /meetings page
// GET /api/meetings?date=YYYY-MM-DD     → meetings on that date
export async function GET(
  request: NextRequest
): Promise<NextResponse<SacramentMeeting[] | ApiError>> {
  const params = request.nextUrl.searchParams;
  const date = params.get('date');

  try {
    if (date !== null) {
      if (!isValidIsoDate(date)) {
        return NextResponse.json({ error: 'date must be a valid date in YYYY-MM-DD format' }, { status: 400 });
      }
      return NextResponse.json(await getMeetingsByDate(date));
    }

    const query = params.get('query') ?? '';
    const pageParam = params.get('page');
    const page = pageParam === null ? 1 : Number(pageParam);
    if (!Number.isInteger(page) || page < 1) {
      return NextResponse.json({ error: 'page must be a positive whole number' }, { status: 400 });
    }

    return NextResponse.json(await getMeetings(query, page));
  } catch (error) {
    console.error('GET /api/meetings failed:', error);
    return NextResponse.json({ error: 'Could not load meetings. Please try again later.' }, { status: 500 });
  }
}
