import { getExpenses } from "@/lib/actions/expense";
import { ExpenseList } from "@/components/expenses/expense-list";
import { AddExpenseButton } from "@/components/expenses/add-expense-button";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const expenses = await getExpenses();

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">
            Pengeluaran
          </h1>
          <p className="text-sm text-muted-foreground">
            Catat dan kelola pengeluaran kamu.
          </p>
        </div>
        <AddExpenseButton />
      </header>

      <ExpenseList expenses={expenses} />
    </div>
  );
}