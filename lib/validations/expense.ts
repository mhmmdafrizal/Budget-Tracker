import { z } from "zod";

export const expenseSchema = z.object({
  category: z.enum(["needs", "wants", "savings"]),
  amount: z
    .string()
    .min(1, "Masukkan jumlah")
    .refine((v) => parseFloat(v) > 0, "Harus lebih dari 0"),
  description: z.string().min(1, "Masukkan deskripsi"),
  date: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;