import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTransactions } from "@/hooks/useTransactions";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { Download } from "lucide-react";

const COLORS = ["#10B981", "#EF4444", "#F97316", "#8B5CF6", "#3B82F6", "#EC4899", "#F59E0B", "#6366F1"];

export default function Reports() {
  const { data: transactions } = useTransactions();
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 5), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const filtered = useMemo(() => {
    return (transactions ?? []).filter((tx) => {
      const d = tx.date;
      return d >= startDate && d <= endDate;
    });
  }, [transactions, startDate, endDate]);

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
  const totalExpenses = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { name: string; value: number; color: string }> = {};
    filtered.filter((t) => t.type === "expense").forEach((t) => {
      const name = (t.categories as any)?.name || "Uncategorized";
      const color = (t.categories as any)?.color || "#6B7280";
      if (!map[name]) map[name] = { name, value: 0, color };
      map[name].value += Number(t.amount);
    });
    return Object.values(map).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { month: string; Income: number; Expenses: number }> = {};
    filtered.forEach((tx) => {
      const m = format(new Date(tx.date), "yyyy-MM");
      if (!months[m]) months[m] = { month: format(new Date(tx.date), "MMM yy"), Income: 0, Expenses: 0 };
      if (tx.type === "income") months[m].Income += Number(tx.amount);
      else months[m].Expenses += Number(tx.amount);
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month));
  }, [filtered]);

  const exportCSV = () => {
    const headers = "Date,Type,Category,Description,Amount,Notes\n";
    const rows = filtered.map((tx) =>
      `${tx.date},${tx.type},${(tx.categories as any)?.name || ""},${tx.description || ""},${tx.amount},${tx.notes || ""}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `budgetdock-report-${startDate}-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    // Simple print-based PDF export
    const printContent = `
      <html><head><title>BudgetDock Report</title>
      <style>body{font-family:sans-serif;padding:20px}table{width:100%;border-collapse:collapse;margin-top:20px}
      th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#f5f5f5}
      h1{color:#166534}h2{color:#333;margin-top:30px}.summary{display:flex;gap:40px;margin:20px 0}
      .stat{padding:15px;border-radius:8px;background:#f9f9f9}.green{color:#10B981}.red{color:#EF4444}</style></head>
      <body><h1>BudgetDock Report</h1><p>${startDate} to ${endDate}</p>
      <div class="summary"><div class="stat"><strong>Income:</strong> <span class="green">$${totalIncome.toFixed(2)}</span></div>
      <div class="stat"><strong>Expenses:</strong> <span class="red">$${totalExpenses.toFixed(2)}</span></div>
      <div class="stat"><strong>Balance:</strong> $${(totalIncome - totalExpenses).toFixed(2)}</div></div>
      <h2>Transactions</h2><table><tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th>Amount</th></tr>
      ${filtered.map((tx) => `<tr><td>${tx.date}</td><td>${tx.type}</td><td>${(tx.categories as any)?.name || ""}</td><td>${tx.description || ""}</td><td>$${Number(tx.amount).toFixed(2)}</td></tr>`).join("")}
      </table></body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(printContent); w.document.close(); w.print(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-foreground">Reports & Analytics</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4 mr-1" /> CSV</Button>
          <Button variant="outline" size="sm" onClick={exportPDF}><Download className="h-4 w-4 mr-1" /> PDF</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="space-y-1">
          <Label>Start Date</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label>End Date</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Income</p><p className="text-xl font-bold text-success">${totalIncome.toFixed(2)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Expenses</p><p className="text-xl font-bold text-destructive">${totalExpenses.toFixed(2)}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Net</p><p className={`text-xl font-bold ${totalIncome - totalExpenses >= 0 ? "text-success" : "text-destructive"}`}>${(totalIncome - totalExpenses).toFixed(2)}</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Monthly Trends</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="month" fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <YAxis fontSize={12} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="Income" fill="hsl(152, 60%, 40%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Spending by Category</CardTitle></CardHeader>
          <CardContent>
            {categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                    {categoryBreakdown.map((entry, i) => <Cell key={i} fill={entry.color || COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground py-12">No expense data for selected period</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
