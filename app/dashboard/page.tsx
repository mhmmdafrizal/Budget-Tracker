import { getBudget } from "@/lib/actions/budget";
import { getExpenses } from "@/lib/actions/expense";
import { formatIDR } from "@/lib/utils";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { BudgetChart } from "@/components/dashboard/budget-chart";
import { BudgetEmptyIcon } from "@/components/dashboard/budget-empty-icon";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const budget = await getBudget();
  const expenses = await getExpenses();

  const spent = { needs: 0, wants: 0, savings: 0 };
  for (const exp of expenses) {
    spent[exp.category as keyof typeof spent] =
      (spent[exp.category as keyof typeof spent] ?? 0) + Number(exp.amount);
  }

  const allocated = budget
    ? {
        needs: Number(budget.needsAmount),
        wants: Number(budget.wantsAmount),
        savings: Number(budget.savingsAmount),
        income: Number(budget.monthlyIncome),
      }
    : null;

  const remaining = allocated
    ? {
        needs: allocated.needs - spent.needs,
        wants: allocated.wants - spent.wants,
        savings: allocated.savings - spent.savings,
      }
    : null;

  const chartData = allocated
    ? [
        { name: "Kebutuhan", allocated: allocated.needs, spent: spent.needs },
        { name: "Keinginan", allocated: allocated.wants, spent: spent.wants },
        { name: "Tabungan", allocated: allocated.savings, spent: spent.savings },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6 select-none">
      <header>
        <h1 className="font-heading text-2xl font-bold tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          {budget
            ? `Ringkasan budget ${formatIDR(allocated!.income)} per bulan`
            : "Atur budget kamu dulu untuk mulai melacak pengeluaran"}
        </p>
      </header>

      {!budget ? (
        <div className="flex flex-col items-start gap-4 rounded-lg border border-border p-8 bg-card">
          <BudgetEmptyIcon />
          <div>
            <h2 className="font-heading text-lg font-semibold">
              Belum ada budget
            </h2>
            <p className="text-sm text-muted-foreground">
              Masukkan pendapatan bulanan kamu dan metode 50-30-20 akan membagi
              otomatis.
            </p>
          </div>
          <a
            href="/dashboard/budget"
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Atur Budget
          </a>
        </div>
      ) : (
        <>
          <SummaryCards allocated={allocated!} remaining={remaining!} />
          <BudgetChart data={chartData} />
        </>
      )}
    </div>
  );
}