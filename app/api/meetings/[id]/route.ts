import { NextResponse } from 'next/server';
import { getMeetingById } from '@/lib/meetings-db';
import type { ApiError, SacramentMeeting } from '@/lib/types';

// GET /api/meetings/:id
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SacramentMeeting | ApiError>> {
  const { id: idParam } = await params;

  // Only digits count as an id, so "abc", "1.5", "-3" and "1e3" all get a 400.
  if (!/^\d+$/.test(idParam) || Number(idParam) <= 0) {
    return NextResponse.json({ error: 'Meeting id must be a positive whole number' }, { status: 400 });
  }
  const id = Number(idParam);

  try {
    const meeting = await getMeetingById(id);

    if (!meeting) {
      return NextResponse.json({ error: `Meeting ${id} not found` }, { status: 404 });
    }

    return NextResponse.json(meeting);
  } catch (error) {
    console.error(`GET /api/meetings/${id} failed:`, error);
    return NextResponse.json({ error: 'Could not load the meeting. Please try again later.' }, { status: 500 });
  }
}
