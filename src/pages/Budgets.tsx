import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useBudgets } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { useTransactions } from "@/hooks/useTransactions";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { Plus, Trash2 } from "lucide-react";

export default function Budgets() {
  const currentMonth = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const { data: budgets, addBudget, deleteBudget } = useBudgets(currentMonth);
  const { data: categories } = useCategories("expense");
  const { data: transactions } = useTransactions("expense");

  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");

  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  const spentByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    (transactions ?? []).forEach((tx) => {
      const d = new Date(tx.date);
      if (d >= monthStart && d <= monthEnd && tx.category_id) {
        map[tx.category_id] = (map[tx.category_id] || 0) + Number(tx.amount);
      }
    });
    return map;
  }, [transactions, monthStart, monthEnd]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    addBudget.mutate(
      { category_id: categoryId || undefined, amount: parseFloat(amount), month: currentMonth },
      { onSuccess: () => { setOpen(false); setAmount(""); setCategoryId(""); } }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Budget Planning</h1>
          <p className="text-muted-foreground">{format(new Date(), "MMMM yyyy")}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Set Budget</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Set Category Budget</DialogTitle></DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Select expense category" /></SelectTrigger>
                  <SelectContent>
                    {(categories ?? []).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Budget Amount ($)</Label>
                <Input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={addBudget.isPending}>Set Budget</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {(budgets ?? []).length > 0 ? (
        <div className="grid gap-4">
          {(budgets ?? []).map((budget) => {
            const spent = budget.category_id ? (spentByCategory[budget.category_id] || 0) : 0;
            const pct = Math.min((spent / Number(budget.amount)) * 100, 100);
            const catName = (budget.categories as any)?.name || "Overall";
            const catColor = (budget.categories as any)?.color || "hsl(var(--primary))";

            return (
              <Card key={budget.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: catColor }} />
                      <span className="font-medium text-foreground">{catName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        ${spent.toFixed(2)} / ${Number(budget.amount).toFixed(2)}
                      </span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteBudget.mutate(budget.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <Progress
                    value={pct}
                    className={`h-2 ${pct >= 100 ? "[&>div]:bg-destructive" : pct >= 80 ? "[&>div]:bg-warning" : "[&>div]:bg-success"}`}
                  />
                  {pct >= 80 && (
                    <p className={`text-xs mt-1 ${pct >= 100 ? "text-destructive" : "text-warning"}`}>
                      {pct >= 100 ? "Budget exceeded!" : "Approaching budget limit"}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground py-12">No budgets set. Create one to start tracking your spending limits.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
