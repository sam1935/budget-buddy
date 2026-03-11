import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCategories } from "@/hooks/useCategories";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Categories() {
  const { data: allCategories, addCategory, updateCategory, deleteCategory } = useCategories();
  const [open, setOpen] = useState(false);
  const [editCat, setEditCat] = useState<any>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("expense");
  const [color, setColor] = useState("#10B981");
  const [icon, setIcon] = useState("tag");

  const incomeCategories = (allCategories ?? []).filter((c) => c.type === "income");
  const expenseCategories = (allCategories ?? []).filter((c) => c.type === "expense");

  const openEdit = (cat: any) => {
    setEditCat(cat);
    setName(cat.name);
    setType(cat.type);
    setColor(cat.color);
    setIcon(cat.icon);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editCat) {
      updateCategory.mutate({ id: editCat.id, name, color, icon }, {
        onSuccess: () => { setOpen(false); setEditCat(null); },
      });
    } else {
      addCategory.mutate({ name, type, color, icon }, {
        onSuccess: () => { setOpen(false); setName(""); setColor("#10B981"); },
      });
    }
  };

  const renderList = (categories: any[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {categories.map((cat) => (
        <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: cat.color + "20" }}>
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
            </div>
            <span className="font-medium text-sm text-foreground">{cat.name}</span>
            {cat.is_default && <Badge variant="secondary" className="text-[10px]">Default</Badge>}
          </div>
          {!cat.is_default && (
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(cat)}><Pencil className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteCategory.mutate(cat.id)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Categories</h1>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setEditCat(null); }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => { setEditCat(null); setName(""); setColor("#10B981"); }}>
              <Plus className="h-4 w-4 mr-1" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editCat ? "Edit" : "Add"} Category</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required maxLength={50} />
              </div>
              {!editCat && (
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex items-center gap-3">
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-10 rounded cursor-pointer" />
                  <Input value={color} onChange={(e) => setColor(e.target.value)} className="flex-1" />
                </div>
              </div>
              <Button type="submit" className="w-full">{editCat ? "Update" : "Add"} Category</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="expense">
        <TabsList>
          <TabsTrigger value="expense">Expense ({expenseCategories.length})</TabsTrigger>
          <TabsTrigger value="income">Income ({incomeCategories.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="expense" className="mt-4">
          {renderList(expenseCategories)}
        </TabsContent>
        <TabsContent value="income" className="mt-4">
          {renderList(incomeCategories)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
