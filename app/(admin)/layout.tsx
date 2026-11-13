import Link from 'next/link';

/**
 * Layout for leader-only pages (create and edit meetings). Route groups keep these pages
 * at /meetings/... URLs while giving them their own layout. Sign-in protection comes in Week 05.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200 bg-accent-soft px-4 py-3">
        <p className="text-sm font-semibold text-ink">Leader tools · sign-in required from Week 05</p>
        <Link href="/meetings" className="text-sm font-semibold text-brand hover:underline">
          ← Back to meetings
        </Link>
      </div>
      {children}
    </div>
  );
}
