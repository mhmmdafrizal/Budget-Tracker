"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { expenseSchema, type ExpenseFormValues } from "@/lib/validations/expense";
import { createExpense, updateExpense } from "@/lib/actions/expense";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Field } from "@base-ui/react/field";
import type { Expense } from "@/lib/types";

const CATEGORIES = [
  { value: "needs", label: "Kebutuhan" },
  { value: "wants", label: "Keinginan" },
  { value: "savings", label: "Tabungan" },
];

type Props = { expense?: Expense | null; onDone?: () => void };

export function ExpenseForm({ expense, onDone }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const toDateStr = (d: Date | string | undefined) =>
    d ? new Date(d).toISOString().slice(0, 10) : undefined;

  const { register, handleSubmit, formState: { errors } } = useForm<ExpenseFormValues>({
    defaultValues: expense
      ? {
          category: expense.category as ExpenseFormValues["category"],
          amount: String(Number(expense.amount)),
          description: expense.description,
          date: toDateStr(expense.date),
        }
      : { category: "needs", date: new Date().toISOString().slice(0, 10) },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      const parsed = expenseSchema.safeParse(values);
      if (!parsed.success) {
        toast.error("Data tidak valid.");
        return;
      }
      const payload = {
        category: parsed.data.category,
        amount: String(parseFloat(parsed.data.amount)),
        description: parsed.data.description,
        date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
      };
      if (expense) {
        await updateExpense(expense.id, payload);
        toast.success("Pengeluaran diperbarui.");
      } else {
        await createExpense(payload);
        toast.success("Pengeluaran ditambahkan.");
      }
      router.refresh();
      onDone?.();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setSaving(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 select-none">
      <Field.Root>
        <div className="space-y-2">
          <Label htmlFor="category">Kategori</Label>
          <select
            id="category"
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-xs"
            {...register("category")}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </Field.Root>
      <Field.Root>
        <div className="space-y-2">
          <Label htmlFor="amount">Jumlah (Rp)</Label>
          <Input
            id="amount"
            type="number"
            min="0"
            step="any"
            placeholder="50000"
            {...register("amount")}
          />
          {errors.amount && (
            <p className="text-xs text-red-600">{errors.amount.message}</p>
          )}
        </div>
      </Field.Root>
      <Field.Root>
        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi</Label>
          <Input
            id="description"
            type="text"
            placeholder="Makan siang, bensin, dll"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-xs text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>
      </Field.Root>
      <Field.Root>
        <div className="space-y-2">
          <Label htmlFor="date">Tanggal</Label>
          <Input id="date" type="date" {...register("date")} />
        </div>
      </Field.Root>
      <Button type="submit" disabled={saving} className="w-full">
        {saving ? "Menyimpan..." : expense ? "Simpan Perubahan" : "Simpan"}
      </Button>
    </form>
  );
}
