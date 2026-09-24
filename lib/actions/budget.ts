"use server";
import "server-only";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { budgets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

async function getUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Tidak terautentikasi");
  return session.user.id;
}

export async function getBudget() {
  const userId = await getUserId();
  const rows = await db
    .select()
    .from(budgets)
    .where(eq(budgets.userId, userId))
    .orderBy(budgets.createdAt)
    .limit(1);
  return rows[0] ?? null;
}

export async function createBudget(data: {
  monthlyIncome: string;
  needsAmount: string;
  wantsAmount: string;
  savingsAmount: string;
}) {
  const userId = await getUserId();
  const existing = await getBudget();
  if (existing) {
    const [updated] = await db
      .update(budgets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(budgets.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(budgets)
    .values({ userId, ...data })
    .returning();
  return created;
}