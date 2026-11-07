import { headers } from 'next/headers';
import type { SacramentMeeting } from './types';

/**
 * Server Components need an absolute URL to call this app's own API routes.
 * The host comes from the incoming request, so it works locally and on any Vercel deployment.
 */
async function getBaseUrl(): Promise<string> {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
  const protocol = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${protocol}://${host}`;
}

export async function fetchMeetings(): Promise<SacramentMeeting[]> {
  const res = await fetch(`${await getBaseUrl()}/api/meetings`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load meetings (${res.status})`);
  return (await res.json()) as SacramentMeeting[];
}

/** Returns null when the API answers 400 (bad id) or 404 (no such meeting). */
export async function fetchMeeting(id: string): Promise<SacramentMeeting | null> {
  const res = await fetch(`${await getBaseUrl()}/api/meetings/${encodeURIComponent(id)}`, {
    cache: 'no-store',
  });
  if (res.status === 400 || res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to load meeting ${id} (${res.status})`);
  return (await res.json()) as SacramentMeeting;
}
