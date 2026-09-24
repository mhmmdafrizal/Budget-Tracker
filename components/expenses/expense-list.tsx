"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash, PencilSimple, Receipt } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatIDR, formatDate } from "@/lib/utils";
import { deleteExpense } from "@/lib/actions/expense";
import type { Expense } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CATEGORY_LABEL: Record<string, string> = {
  needs: "Kebutuhan",
  wants: "Keinginan",
  savings: "Tabungan",
};

type Props = { expenses: Expense[] };

export function ExpenseList({ expenses }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);

  const handleDelete = async () => {
    if (!deleting) return;
    await deleteExpense(deleting.id);
    setDeleting(null);
    router.refresh();
  };

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
        <Receipt size={40} className="text-muted-foreground mb-3" />
        <h3 className="text-sm font-semibold text-foreground mb-1">
          Belum ada pengeluaran
        </h3>
        <p className="text-xs text-muted-foreground max-w-xs">
          Klik tombol Tambah untuk mencatat pengeluaran pertama kamu.
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="text-right">Jumlah</TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.map((exp) => (
            <TableRow key={exp.id}>
              <TableCell>{formatDate(exp.date)}</TableCell>
              <TableCell>{exp.description}</TableCell>
              <TableCell>{CATEGORY_LABEL[exp.category] ?? exp.category}</TableCell>
              <TableCell className="text-right font-medium">
                {formatIDR(Number(exp.amount))}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1 justify-end">
                  <Dialog
                    open={editing?.id === exp.id}
                    onOpenChange={(open) => {
                      if (!open) setEditing(null);
                    }}
                  >
                    <DialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Edit"
                          onClick={() => setEditing(exp)}
                        />
                      }
                    >
                      <PencilSimple size={14} />
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Pengeluaran</DialogTitle>
                      </DialogHeader>
                      <ExpenseForm
                        expense={editing}
                        onDone={() => setEditing(null)}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Hapus"
                    onClick={() => setDeleting(exp)}
                  >
                    <Trash size={14} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Hapus Pengeluaran"
        description={`Yakin ingin menghapus "${deleting?.description}"? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={handleDelete}
        confirmLabel="Hapus"
      />
    </>
  );
}
