import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCategories } from "@/hooks/useCategories";
import { useTransactions } from "@/hooks/useTransactions";
import { Plus } from "lucide-react";

interface TransactionDialogProps {
  type?: "income" | "expense";
  trigger?: React.ReactNode;
  editData?: any;
  onClose?: () => void;
}

export function TransactionDialog({ type: defaultType, trigger, editData, onClose }: TransactionDialogProps) {
  const [open, setOpen] = useState(!!editData);
  const [txType, setTxType] = useState<"income" | "expense">(editData?.type || defaultType || "expense");
  const { data: categories } = useCategories(txType);
  const { addTransaction, updateTransaction } = useTransactions();

  const [amount, setAmount] = useState(editData?.amount?.toString() || "");
  const [description, setDescription] = useState(editData?.description || "");
  const [notes, setNotes] = useState(editData?.notes || "");
  const [categoryId, setCategoryId] = useState(editData?.category_id || "");
  const [date, setDate] = useState(editData?.date || new Date().toISOString().split("T")[0]);
  const [isRecurring, setIsRecurring] = useState(editData?.is_recurring || false);
  const [recurringInterval, setRecurringInterval] = useState(editData?.recurring_interval || "monthly");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      type: txType,
      amount: parseFloat(amount),
      description: description || undefined,
      notes: notes || undefined,
      category_id: categoryId || undefined,
      date,
      is_recurring: isRecurring,
      recurring_interval: isRecurring ? recurringInterval : undefined,
    };

    if (editData) {
      updateTransaction.mutate({ id: editData.id, ...payload }, {
        onSuccess: () => { setOpen(false); onClose?.(); },
      });
    } else {
      addTransaction.mutate(payload, {
        onSuccess: () => {
          setOpen(false);
          setAmount(""); setDescription(""); setNotes(""); setCategoryId(""); setIsRecurring(false);
        },
      });
    }
  };

  const dialogContent = (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{editData ? "Edit" : "Add"} {txType === "income" ? "Income" : "Expense"}</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!defaultType && !editData && (
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={txType} onValueChange={(v) => setTxType(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="space-y-2">
          <Label>Amount ($)</Label>
          <Input type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g., Monthly salary" maxLength={200} />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
            <SelectContent>
              {(categories ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Date</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes..." maxLength={500} />
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
          <Label>Recurring</Label>
          {isRecurring && (
            <Select value={recurringInterval} onValueChange={setRecurringInterval}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={addTransaction.isPending || updateTransaction.isPending}>
          {editData ? "Update" : "Add"} Transaction
        </Button>
      </form>
    </DialogContent>
  );

  if (editData) {
    return (
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) onClose?.(); }}>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add {defaultType === "income" ? "Income" : defaultType === "expense" ? "Expense" : "Transaction"}
          </Button>
        )}
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
