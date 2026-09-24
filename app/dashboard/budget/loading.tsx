export default function BudgetLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl animate-pulse">
      <header>
        <div className="h-7 w-28 rounded-lg bg-muted" />
        <div className="mt-2 h-4 w-72 rounded-lg bg-muted" />
      </header>
      <div className="rounded-lg border border-border bg-card p-5 space-y-5">
        <div className="h-4 w-28 rounded-lg bg-muted" />
        <div className="h-8 w-full rounded-lg bg-muted" />
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-border p-3 space-y-2">
              <div className="h-3 w-20 rounded-lg bg-muted" />
              <div className="h-4 w-24 rounded-lg bg-muted" />
            </div>
          ))}
        </div>
        <div className="h-8 w-32 rounded-lg bg-muted" />
      </div>
      <div className="rounded-lg border border-border bg-card p-5 space-y-5">
        <div className="h-4 w-48 rounded-lg bg-muted" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-full rounded-lg bg-muted" />
            <div className="h-2 w-full rounded-lg bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
