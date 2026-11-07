import { NextResponse } from 'next/server';
import { getMeetingById } from '@/lib/meetings-db';
import type { ApiError, SacramentMeeting } from '@/lib/types';

// GET /api/meetings/:id
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<SacramentMeeting | ApiError>> {
  const { id: idParam } = await params;
  const id = Number(idParam);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Meeting id must be a positive whole number' }, { status: 400 });
  }

  const meeting = getMeetingById(id);

  if (!meeting) {
    return NextResponse.json({ error: `Meeting ${id} not found` }, { status: 404 });
  }

  return NextResponse.json(meeting);
}
