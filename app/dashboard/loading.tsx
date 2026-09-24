export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <header>
        <div className="h-7 w-40 rounded-lg bg-muted" />
        <div className="mt-2 h-4 w-64 rounded-lg bg-muted" />
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="h-4 w-24 rounded-lg bg-muted" />
            <div className="h-6 w-32 rounded-lg bg-muted" />
            <div className="h-3 w-20 rounded-lg bg-muted" />
            <div className="h-1 w-full rounded-lg bg-muted" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="h-4 w-48 rounded-lg bg-muted mb-4" />
        <div className="h-64 w-full rounded-lg bg-muted" />
      </div>
    </div>
  );
}
