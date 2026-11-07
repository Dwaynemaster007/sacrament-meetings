import { NextResponse, type NextRequest } from 'next/server';
import { getMeetings } from '@/lib/meetings-db';
import type { ApiError, SacramentMeeting } from '@/lib/types';

// GET /api/meetings          → all meetings (newest first)
// GET /api/meetings?date=YYYY-MM-DD → meetings on that date
export async function GET(
  request: NextRequest
): Promise<NextResponse<SacramentMeeting[] | ApiError>> {
  const date = request.nextUrl.searchParams.get('date');

  if (date !== null && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'date must be in YYYY-MM-DD format' }, { status: 400 });
  }

  return NextResponse.json(getMeetings(date));
}
