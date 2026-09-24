import { getBudget } from "@/lib/actions/budget";
import { getExpenses } from "@/lib/actions/expense";
import { formatIDR } from "@/lib/utils";
import { BudgetForm } from "@/components/budget/budget-form";
import { CategoryProgress } from "@/components/budget/category-progress";

export const dynamic = "force-dynamic";

export default async function BudgetPage() {
  const [budget, expenses] = await Promise.all([getBudget(), getExpenses()]);

  const spent = { needs: 0, wants: 0, savings: 0 };
  for (const exp of expenses) {
    spent[exp.category as keyof typeof spent] =
      (spent[exp.category as keyof typeof spent] ?? 0) + Number(exp.amount);
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl select-none">
      <header>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Budget</h1>
        <p className="text-sm text-muted-foreground">
          Metode 50-30-20: kebutuhan 50%, keinginan 30%, tabungan 20%.
        </p>
      </header>

      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="font-heading text-sm font-semibold mb-4">
          {budget ? "Ubah Budget" : "Atur Budget"}
        </h2>
        <BudgetForm />
      </div>

      {budget && (
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="font-heading text-sm font-semibold mb-4">
            Ringkasan · {formatIDR(Number(budget.monthlyIncome))}/bulan
          </h2>
          <div className="flex flex-col gap-4">
            <CategoryProgress
              label="Kebutuhan (50%)"
              allocated={Number(budget.needsAmount)}
              spent={spent.needs}
            />
            <CategoryProgress
              label="Keinginan (30%)"
              allocated={Number(budget.wantsAmount)}
              spent={spent.wants}
            />
            <CategoryProgress
              label="Tabungan (20%)"
              allocated={Number(budget.savingsAmount)}
              spent={spent.savings}
            />
          </div>
        </div>
      )}
    </div>
  );
}