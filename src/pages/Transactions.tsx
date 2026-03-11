import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionDialog } from "@/components/TransactionDialog";
import { format } from "date-fns";
import { Pencil, Trash2, Search } from "lucide-react";

export default function Transactions() {
  const { data: transactions, isLoading, deleteTransaction } = useTransactions();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [editTx, setEditTx] = useState<any>(null);

  const filtered = (transactions ?? []).filter((tx) => {
    if (typeFilter !== "all" && tx.type !== typeFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        (tx.description?.toLowerCase().includes(s)) ||
        ((tx.categories as any)?.name?.toLowerCase().includes(s))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
        <TransactionDialog />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filtered.length > 0 ? (
            <div className="space-y-2">
              {filtered.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ backgroundColor: (tx.categories as any)?.color + "20", color: (tx.categories as any)?.color }}
                    >
                      {((tx.categories as any)?.name || "?")[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{tx.description || (tx.categories as any)?.name || "Transaction"}</p>
                      <p className="text-xs text-muted-foreground">{(tx.categories as any)?.name} · {format(new Date(tx.date), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${tx.type === "income" ? "text-success" : "text-destructive"}`}>
                      {tx.type === "income" ? "+" : "-"}${Number(tx.amount).toFixed(2)}
                    </span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditTx(tx)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteTransaction.mutate(tx.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-12">{isLoading ? "Loading..." : "No transactions found"}</p>
          )}
        </CardContent>
      </Card>

      {editTx && <TransactionDialog editData={editTx} onClose={() => setEditTx(null)} />}
    </div>
  );
}
