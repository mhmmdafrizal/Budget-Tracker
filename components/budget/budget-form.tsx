"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { Field } from "@base-ui/react/field";
import { budgetSchema } from "@/lib/validations/budget";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/utils";
import { createBudget } from "@/lib/actions/budget";

type FormValues = { monthlyIncome: string };

export function BudgetForm() {
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>();

  const income = watch("monthlyIncome");
  const num = parseFloat(income ?? "0");
  const valid = !isNaN(num) && num > 0;
  const split = valid
    ? {
        needs: Math.round(num * 0.5),
        wants: Math.round(num * 0.3),
        savings: Math.round(num * 0.2),
      }
    : null;

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      const parsed = budgetSchema.safeParse(values);
      if (!parsed.success) {
        toast.error("Masukkan jumlah pendapatan yang valid.");
        return;
      }
      const incomeNum = parseFloat(parsed.data.monthlyIncome);
      await createBudget({
        monthlyIncome: String(incomeNum),
        needsAmount: String(Math.round(incomeNum * 0.5)),
        wantsAmount: String(Math.round(incomeNum * 0.3)),
        savingsAmount: String(Math.round(incomeNum * 0.2)),
      });
      toast.success("Budget berhasil disimpan.");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setSaving(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-5 select-none">
      <Field.Root>
        <div className="space-y-2">
          <Label htmlFor="income">Pendapatan Bulanan (take-home)</Label>
          <div className="flex items-center">
            <span className="flex items-center justify-center h-8 px-2.5 rounded-l-lg border border-r-0 border-input bg-muted text-xs text-muted-foreground">
              Rp
            </span>
            <Input
              id="income"
              type="number"
              min="0"
              placeholder="5.000.000"
              className="rounded-l-none border-l-0"
              {...register("monthlyIncome")}
            />
          </div>
          {errors.monthlyIncome && (
            <p className="text-xs text-red-600">
              {errors.monthlyIncome.message}
            </p>
          )}
        </div>
      </Field.Root>
      {split && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Kebutuhan 50%</p>
            <p className="font-heading text-sm font-bold">
              {formatIDR(split.needs)}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Keinginan 30%</p>
            <p className="font-heading text-sm font-bold">
              {formatIDR(split.wants)}
            </p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Tabungan 20%</p>
            <p className="font-heading text-sm font-bold">
              {formatIDR(split.savings)}
            </p>
          </div>
        </div>
      )}
      <Button type="submit" disabled={saving || !valid}>
        {saving ? "Menyimpan..." : "Simpan Budget"}
      </Button>
    </form>
  );
}
