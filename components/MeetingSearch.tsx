'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

/**
 * Search box whose text lives in the URL (?query=...), so a search survives a refresh,
 * can be shared as a link, and works with the back button. Typing is debounced by 300 ms
 * so the database is queried once the user pauses, not on every keystroke.
 */
export default function MeetingSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const urlQuery = searchParams.get('query') ?? '';
  const inputRef = useRef<HTMLInputElement>(null);
  const lastPushed = useRef(urlQuery);

  // defaultValue only sets the box once, so update it when the URL changes without typing
  // (back and forward buttons).
  useEffect(() => {
    if (inputRef.current && urlQuery !== lastPushed.current) {
      inputRef.current.value = urlQuery;
      lastPushed.current = urlQuery;
    }
  }, [urlQuery]);

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    const trimmed = term.trim();
    params.set('page', '1'); // a new search always starts on the first page
    if (trimmed) {
      params.set('query', trimmed);
    } else {
      params.delete('query');
    }
    lastPushed.current = trimmed;
    // push (rather than replace) adds a history entry, so the back button returns to the previous search.
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, 300);

  return (
    <div className="mt-6">
      <label htmlFor="meeting-search" className="mb-1 block text-sm font-semibold text-ink">
        Search meetings
      </label>
      <input
        id="meeting-search"
        ref={inputRef}
        type="search"
        placeholder="Search by speaker, leader, or meeting type..."
        aria-label="Search meetings"
        defaultValue={urlQuery}
        maxLength={100}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full rounded-lg border border-line bg-card px-4 py-2.5 text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
    </div>
  );
}
