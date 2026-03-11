import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from "@/hooks/useTransactions";
import { TransactionDialog } from "@/components/TransactionDialog";
import { TrendingUp, TrendingDown, Wallet, Target } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";

const COLORS = ["#10B981", "#EF4444", "#F97316", "#8B5CF6", "#3B82F6", "#EC4899", "#F59E0B", "#6366F1", "#14B8A6", "#F43F5E"];

export default function Dashboard() {
  const { data: transactions, isLoading } = useTransactions();

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const stats = useMemo(() => {
    if (!transactions) return { income: 0, expenses: 0, balance: 0 };
    const monthTxs = transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= monthStart && d <= monthEnd;
    });
    const income = monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const expenses = monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions, monthStart, monthEnd]);

  const pieData = useMemo(() => {
    if (!transactions) return [];
    const monthExpenses = transactions.filter(
      (t) => t.type === "expense" && new Date(t.date) >= monthStart && new Date(t.date) <= monthEnd
    );
    const byCategory: Record<string, { name: string; value: number; color: string }> = {};
    monthExpenses.forEach((t) => {
      const name = (t.categories as any)?.name || "Uncategorized";
      const color = (t.categories as any)?.color || "#6B7280";
      if (!byCategory[name]) byCategory[name] = { name, value: 0, color };
      byCategory[name].value += Number(t.amount);
    });
    return Object.values(byCategory);
  }, [transactions, monthStart, monthEnd]);

  const barData = useMemo(() => {
    if (!transactions) return [];
    return Array.from({ length: 6 }, (_, i) => {
      const month = subMonths(now, 5 - i);
      const ms = startOfMonth(month);
      const me = endOfMonth(month);
      const monthTxs = transactions.filter((t) => {
        const d = new Date(t.date);
        return d >= ms && d <= me;
      });
      return {
        month: format(month, "MMM"),
        Income: monthTxs.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
        Expenses: monthTxs.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0),
      };
    });
  }, [transactions]);

  const recentTxs = (transactions ?? []).slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">{format(now, "MMMM yyyy")} Overview</p>
        </div>
        <div className="flex gap-2">
          <TransactionDialog type="income" trigger={<Button variant="outline" size="sm"><TrendingUp className="h-4 w-4 mr-1" /> Add Income</Button>} />
          <TransactionDialog type="expense" trigger={<Button variant="outline" size="sm"><TrendingDown className="h-4 w-4 mr-1" /> Add Expense</Button>} />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-success">${stats.income.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-destructive">${stats.expenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p className={`text-2xl font-bold ${stats.balance >= 0 ? "text-success" : "text-destructive"}`}>
                  ${Math.abs(stats.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <p className="text-2xl font-bold text-foreground">{recentTxs.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center">
                <Target className="h-5 w-5 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No expense data this month</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Income vs Expenses (6 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}>
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="Income" fill="hsl(152, 60%, 40%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTxs.length > 0 ? (
            <div className="space-y-3">
              {recentTxs.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: (tx.categories as any)?.color + "20", color: (tx.categories as any)?.color }}
                    >
                      {((tx.categories as any)?.name || "?")[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.description || (tx.categories as any)?.name || "Transaction"}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(tx.date), "MMM d, yyyy")}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${tx.type === "income" ? "text-success" : "text-destructive"}`}>
                    {tx.type === "income" ? "+" : "-"}${Number(tx.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No transactions yet. Start by adding income or expenses!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
