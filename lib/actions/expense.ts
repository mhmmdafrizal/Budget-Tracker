"use server";
import "server-only";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { expenses, budgets } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

async function getUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Tidak terautentikasi");
  return session.user.id;
}

export async function getExpenses(filters?: { category?: string }) {
  const userId = await getUserId();
  const conditions = [eq(expenses.userId, userId)];

  if (filters?.category) {
    conditions.push(eq(expenses.category, filters.category));
  }

  const rows = await db
    .select()
    .from(expenses)
    .where(and(...conditions))
    .orderBy(desc(expenses.date));
  return rows;
}

export async function createExpense(data: {
  category: string;
  amount: string;
  description: string;
  date?: Date;
}) {
  const userId = await getUserId();
  const budget = await db
    .select()
    .from(budgets)
    .where(eq(budgets.userId, userId))
    .limit(1);
  if (budget.length === 0) throw new Error("Atur budget dulu sebelum mencatat pengeluaran.");

  const [created] = await db
    .insert(expenses)
    .values({ userId, budgetId: budget[0].id, ...data })
    .returning();
  return created;
}

export async function updateExpense(
  id: string,
  data: Partial<{
    category: string;
    amount: string;
    description: string;
    date: Date;
  }>
) {
  const userId = await getUserId();
  const [found] = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
    .limit(1);
  if (!found) throw new Error("Pengeluaran tidak ditemukan.");

  const [updated] = await db
    .update(expenses)
    .set(data)
    .where(eq(expenses.id, id))
    .returning();
  return updated;
}

export async function deleteExpense(id: string) {
  const userId = await getUserId();
  await db
    .delete(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
}