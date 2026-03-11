import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionDialog } from "@/components/TransactionDialog";
import { format } from "date-fns";
import { Pencil, Trash2, TrendingDown } from "lucide-react";

export default function Expenses() {
  const { data: transactions, isLoading, deleteTransaction } = useTransactions("expense");
  const [editTx, setEditTx] = useState<any>(null);

  const totalExpenses = (transactions ?? []).reduce((s, t) => s + Number(t.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground">Total: <span className="text-destructive font-semibold">${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></p>
        </div>
        <TransactionDialog type="expense" />
      </div>

      <Card>
        <CardContent className="pt-6">
          {(transactions ?? []).length > 0 ? (
            <div className="space-y-2">
              {(transactions ?? []).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-destructive/10 flex items-center justify-center">
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.description || (tx.categories as any)?.name || "Expense"}</p>
                      <p className="text-xs text-muted-foreground">{(tx.categories as any)?.name} · {format(new Date(tx.date), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-destructive">-${Number(tx.amount).toFixed(2)}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditTx(tx)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteTransaction.mutate(tx.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">{isLoading ? "Loading..." : "No expense records yet"}</p>
          )}
        </CardContent>
      </Card>

      {editTx && <TransactionDialog type="expense" editData={editTx} onClose={() => setEditTx(null)} />}
    </div>
  );
}
