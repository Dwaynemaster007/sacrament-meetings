import NavLinks, { type NavLinkItem } from '@/components/NavLinks';

const sectionLinks: NavLinkItem[] = [
  { href: '/meetings', label: 'All meetings', exact: true },
  { href: '/meetings/current', label: 'This Sunday' },
];

export default function MeetingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 print:max-w-none print:p-0">
      <div className="mb-8 print:hidden">
        <NavLinks links={sectionLinks} ariaLabel="Meetings" variant="section" />
      </div>
      {children}
    </div>
  );
}
