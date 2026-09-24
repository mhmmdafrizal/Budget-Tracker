export type Expense = {
  id: string;
  budgetId: string;
  userId: string;
  category: string;
  amount: string;
  description: string;
  date: Date | string;
  createdAt: Date | string;
};