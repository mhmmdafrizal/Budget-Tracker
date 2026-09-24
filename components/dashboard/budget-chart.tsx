"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  data: { name: string; allocated: number; spent: number }[];
};

export function BudgetChart({ data }: Props) {
  if (data.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="font-heading text-sm font-semibold mb-4">
        Alokasi vs Pengeluaran
      </h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey="name" fontSize={12} stroke="var(--muted-foreground)" />
          <YAxis fontSize={12} stroke="var(--muted-foreground)" />
          <Tooltip
            formatter={(value) =>
              new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                maximumFractionDigits: 0,
              }).format(Number(value))
            }
          />
          <Legend />
          <Bar dataKey="allocated" name="Alokasi" fill="var(--primary)" radius={0} />
          <Bar dataKey="spent" name="Terpakai" fill="var(--destructive)" radius={0} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}