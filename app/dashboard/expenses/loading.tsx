export default function ExpensesLoading() {
  return (
    <div className="flex flex-col gap-6 animate-pulse select-none">
      <header className="flex items-center justify-between">
        <div>
          <div className="h-7 w-36 rounded-lg bg-muted" />
          <div className="mt-2 h-4 w-56 rounded-lg bg-muted" />
        </div>
        <div className="h-8 w-24 rounded-lg bg-muted" />
      </header>
      <div className="rounded-lg border border-border">
        <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
          <div className="h-4 w-20 rounded-lg bg-muted" />
          <div className="h-4 w-32 rounded-lg bg-muted" />
          <div className="h-4 w-24 rounded-lg bg-muted" />
          <div className="h-4 w-24 rounded-lg bg-muted ml-auto" />
        </div>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
            <div className="h-4 w-20 rounded-lg bg-muted" />
            <div className="h-4 w-36 rounded-lg bg-muted" />
            <div className="h-4 w-20 rounded-lg bg-muted" />
            <div className="h-4 w-24 rounded-lg bg-muted ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
