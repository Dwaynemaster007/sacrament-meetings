import { Suspense } from 'react';
import Link from 'next/link';
import NavLinks, { type NavLinkItem } from './NavLinks';
import CurrentDate from './CurrentDate';
import { WARD_NAME } from '@/lib/meeting-utils';

const links: NavLinkItem[] = [
  { href: '/', label: 'Home', exact: true },
  { href: '/meetings', label: 'Meetings' },
];

export default function Header() {
  return (
    <header className="bg-brand text-white print:hidden">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-brand"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/" className="font-serif text-xl font-bold tracking-tight sm:text-2xl">
            {WARD_NAME}
          </Link>
          <p className="text-sm text-white/90">
            <Suspense fallback={<span>&nbsp;</span>}>
              <CurrentDate />
            </Suspense>
          </p>
        </div>
        <NavLinks links={links} ariaLabel="Main" />
      </div>
    </header>
  );
}
