import Image from 'next/image';
import Link from 'next/link';
import { WARD_NAME } from '@/lib/meeting-utils';
import chapel from '@/public/images/chapel.jpg';

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <section className="overflow-hidden rounded-2xl border border-line bg-card shadow-sm">
        <Image
          src={chapel}
          alt="Illustration of a white chapel with a steeple among green hills at sunrise"
          width={1200}
          height={500}
          priority
          placeholder="blur"
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="h-auto w-full"
        />
        <div className="p-6 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">{WARD_NAME}</p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-ink sm:text-4xl">Sacrament Meeting Planner</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">
            Plan and review each Sunday&apos;s agenda in one place: announcements, prayers, ward business, hymns,
            speakers and musical numbers. Members can view and print the program for this week or any past week.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/meetings/current"
              className="rounded-md bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              This Sunday&apos;s program
            </Link>
            <Link
              href="/meetings"
              className="rounded-md border border-brand px-5 py-3 font-semibold text-brand hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Browse all meetings
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="features-heading" className="mt-10">
        <h2 id="features-heading" className="font-serif text-2xl font-bold text-ink">
          What you can do
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          <li className="rounded-xl border border-line bg-card p-5">
            <h3 className="font-semibold text-ink">Plan each Sunday</h3>
            <p className="mt-1 text-sm text-muted">Regular, fast &amp; testimony, stake and general conference Sundays.</p>
          </li>
          <li className="rounded-xl border border-line bg-card p-5">
            <h3 className="font-semibold text-ink">Review full agendas</h3>
            <p className="mt-1 text-sm text-muted">Every hymn, prayer, speaker and item of ward business.</p>
          </li>
          <li className="rounded-xl border border-line bg-card p-5">
            <h3 className="font-semibold text-ink">Print programs</h3>
            <p className="mt-1 text-sm text-muted">A clean, printer-friendly program for any week.</p>
          </li>
        </ul>
      </section>
    </div>
  );
}
