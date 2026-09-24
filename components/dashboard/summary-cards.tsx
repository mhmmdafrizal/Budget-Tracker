"use client";

import { formatIDR } from "@/lib/utils";
import { House, GameController, PiggyBank } from "@phosphor-icons/react";

const BUCKETS = [
  {
    key: "needs",
    label: "Kebutuhan",
    percent: 50,
    icon: House,
  },
  {
    key: "wants",
    label: "Keinginan",
    percent: 30,
    icon: GameController,
  },
  {
    key: "savings",
    label: "Tabungan",
    percent: 20,
    icon: PiggyBank,
  },
] as const;

type Props = {
  allocated: { needs: number; wants: number; savings: number };
  remaining: { needs: number; wants: number; savings: number };
};

export function SummaryCards({ allocated, remaining }: Props) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 select-none">
      {BUCKETS.map(({ key, label, percent, icon: Icon }) => {
        const alloc = allocated[key];
        const remain = remaining[key];
        const usedPct = alloc > 0 ? Math.min(100, ((alloc - remain) / alloc) * 100) : 0;
        return (
          <div
            key={key}
            className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon size={16} />
                {label}
              </span>
              <span className="text-xs text-muted-foreground">{percent}%</span>
            </div>
            <span className="font-heading text-xl font-bold tracking-tight">
              {formatIDR(remain)}
            </span>
            <span className="text-xs text-muted-foreground">
              dari {formatIDR(alloc)} · terpakai {usedPct.toFixed(0)}%
            </span>
            <div className="mt-1 h-1 w-full bg-muted">
              <div
                className={`h-full ${remain < 0 ? "bg-destructive" : "bg-primary"}`}
                style={{ width: `${usedPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}