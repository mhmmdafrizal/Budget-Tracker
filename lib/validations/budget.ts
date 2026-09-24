import { z } from "zod";

export const budgetSchema = z.object({
  monthlyIncome: z
    .string()
    .min(1, "Masukkan pendapatan")
    .refine((v) => parseFloat(v) > 0, "Harus lebih dari 0"),
});

export type BudgetFormValues = z.infer<typeof budgetSchema>;