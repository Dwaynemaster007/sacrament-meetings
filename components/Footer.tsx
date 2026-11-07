import { WARD_NAME } from '@/lib/meeting-utils';

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-line bg-card print:hidden">
      <div className="mx-auto max-w-5xl px-4 py-6 text-center text-sm text-muted">
        <p>{WARD_NAME} · Sacrament Meeting Planner</p>
        <p className="mt-1">WDD 430 · Thubelihle Dlamini</p>
      </div>
    </footer>
  );
}
