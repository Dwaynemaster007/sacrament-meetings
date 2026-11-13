'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
  totalPages: number;
}

const linkClass =
  'rounded-md border border-brand px-4 py-2 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';

/** Previous / "Page X of Y" / Next links. Each link keeps the current search query. */
export default function Pagination({ totalPages }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const parsed = Number(searchParams.get('page'));
  // Same rule as the page: anything that isn't a positive whole number means page 1.
  const currentPage = Number.isInteger(parsed) && parsed > 0 ? parsed : 1;

  if (totalPages <= 1) return null;

  const createPageURL = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    return `${pathname}?${params.toString()}`;
  };

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-4">
      {currentPage > 1 ? (
        <Link href={createPageURL(Math.min(currentPage - 1, totalPages))} className={linkClass} rel="prev">
          ← Previous
        </Link>
      ) : (
        <span aria-hidden="true" className="invisible px-4 py-2 text-sm">
          ← Previous
        </span>
      )}

      <p className="text-sm font-medium text-ink">
        Page {currentPage} of {totalPages}
      </p>

      {currentPage < totalPages ? (
        <Link href={createPageURL(currentPage + 1)} className={linkClass} rel="next">
          Next →
        </Link>
      ) : (
        <span aria-hidden="true" className="invisible px-4 py-2 text-sm">
          Next →
        </span>
      )}
    </nav>
  );
}
