import { formatIDR } from "@/lib/utils";

type Props = {
  label: string;
  allocated: number;
  spent: number;
};

export function CategoryProgress({ label, allocated, spent }: Props) {
  const pct = allocated > 0 ? Math.min(100, (spent / allocated) * 100) : 0;
  const over = spent > allocated;
  const remaining = allocated - spent;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="text-xs text-muted-foreground">
          {formatIDR(spent)} / {formatIDR(allocated)}
        </span>
      </div>
      <div className="h-2 w-full bg-muted">
        <div
          className={`h-full ${over ? "bg-destructive" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs ${over ? "text-destructive" : "text-muted-foreground"}`}>
        {over
          ? `Melebihi ${formatIDR(Math.abs(remaining))}`
          : `Sisa ${formatIDR(remaining)}`}
      </span>
    </div>
  );
}