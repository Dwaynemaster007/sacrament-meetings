'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavLinkItem {
  href: string;
  label: string;
  /** When true, the link is only active on an exact match (use for "/" and section index pages). */
  exact?: boolean;
}

interface NavLinksProps {
  links: NavLinkItem[];
  ariaLabel: string;
  variant?: 'header' | 'section';
}

const styles = {
  header: {
    list: 'flex flex-wrap gap-2',
    base: 'rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
    active: 'bg-white text-brand',
    idle: 'text-white hover:bg-brand-dark',
  },
  section: {
    list: 'flex flex-wrap gap-6 border-b border-line',
    base: '-mb-px inline-block border-b-2 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-brand',
    active: 'border-brand text-brand',
    idle: 'border-transparent text-muted hover:text-brand',
  },
} as const;

/**
 * usePathname() can't be known while prerendering a dynamic route such as /meetings/[id],
 * so the links first render without an active style and the active state streams in.
 */
export default function NavLinks(props: NavLinksProps) {
  return (
    <Suspense fallback={<LinkList {...props} pathname={null} />}>
      <ActiveLinkList {...props} />
    </Suspense>
  );
}

function ActiveLinkList(props: NavLinksProps) {
  const pathname = usePathname();
  return <LinkList {...props} pathname={pathname} />;
}

function LinkList({ links, ariaLabel, variant = 'header', pathname }: NavLinksProps & { pathname: string | null }) {
  const s = styles[variant];

  return (
    <nav aria-label={ariaLabel}>
      <ul className={s.list}>
        {links.map((link) => {
          const isActive =
            pathname !== null &&
            (link.exact ? pathname === link.href : pathname === link.href || pathname.startsWith(`${link.href}/`));

          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`${s.base} ${isActive ? s.active : s.idle}`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
