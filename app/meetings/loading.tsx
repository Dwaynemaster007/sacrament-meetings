export default function MeetingsLoading() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading meetings…</span>
      <div className="mb-6 h-8 w-64 animate-pulse rounded bg-line" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-xl border border-line bg-card" />
        ))}
      </div>
    </div>
  );
}
