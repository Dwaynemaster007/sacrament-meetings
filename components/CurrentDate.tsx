import { connection } from 'next/server';
import { formatToday } from '@/lib/meeting-utils';

/** Shows today's date. connection() makes it render per request instead of being frozen at build time. */
export default async function CurrentDate() {
  await connection();
  const now = new Date();

  return <time dateTime={now.toISOString().slice(0, 10)}>{formatToday(now)}</time>;
}
