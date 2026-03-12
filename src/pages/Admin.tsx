import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Users, ArrowDownUp, AlertTriangle, Tags, PiggyBank, Bell, Search, UserPlus, Trash2, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ProfileRow {
  id: string;
  full_name: string | null;
  currency: string;
  created_at: string;
}

interface RoleRow {
  id: string;
  user_id: string;
  role: "admin" | "user";
}

interface TransactionRow {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  description: string | null;
  date: string;
  created_at: string;
}

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalCategories: 0,
    totalBudgets: 0,
    totalIncome: 0,
    totalExpenses: 0,
  });
  const [users, setUsers] = useState<(ProfileRow & { roles: string[] })[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TransactionRow[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<"admin" | "user">("user");
  const [loading, setLoading] = useState(false);

  // Check admin status
  useEffect(() => {
    if (!user) return;
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setIsAdmin(data === true);
    });
  }, [user]);

  // Load all admin data
  useEffect(() => {
    if (!isAdmin) return;
    loadStats();
    loadUsers();
    loadRecentTransactions();
  }, [isAdmin]);

  async function loadStats() {
    const [profilesRes, txRes, catRes, budgetRes, incomeRes, expenseRes] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("transactions").select("id", { count: "exact", head: true }),
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("budgets").select("id", { count: "exact", head: true }),
      supabase.from("transactions").select("amount").eq("type", "income"),
      supabase.from("transactions").select("amount").eq("type", "expense"),
    ]);

    const totalIncome = (incomeRes.data ?? []).reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpenses = (expenseRes.data ?? []).reduce((sum, t) => sum + Number(t.amount), 0);

    setStats({
      totalUsers: profilesRes.count ?? 0,
      totalTransactions: txRes.count ?? 0,
      totalCategories: catRes.count ?? 0,
      totalBudgets: budgetRes.count ?? 0,
      totalIncome,
      totalExpenses,
    });
  }

  async function loadUsers() {
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name, currency, created_at").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
    ]);

    const roles = (rolesRes.data ?? []) as RoleRow[];
    const profilesWithRoles = (profilesRes.data ?? []).map((p) => ({
      ...p,
      roles: roles.filter((r) => r.user_id === p.id).map((r) => r.role),
    }));
    setUsers(profilesWithRoles);
  }

  async function loadRecentTransactions() {
    const { data } = await supabase
      .from("transactions")
      .select("id, user_id, amount, type, description, date, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    setRecentTransactions((data ?? []) as TransactionRow[]);
  }

  async function handleAssignRole() {
    if (!selectedUserId) return;
    setLoading(true);

    // Check if role already exists
    const { data: existing } = await supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", selectedUserId)
      .eq("role", selectedRole);

    if (existing && existing.length > 0) {
      toast({ title: "Role already assigned", description: "This user already has this role.", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("user_roles")
      .insert({ user_id: selectedUserId, role: selectedRole });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role assigned", description: `Successfully assigned ${selectedRole} role.` });
      loadUsers();
    }
    setLoading(false);
    setRoleDialogOpen(false);
  }

  async function handleRemoveRole(userId: string, role: "admin" | "user") {
    if (userId === user?.id && role === "admin") {
      toast({ title: "Cannot remove", description: "You cannot remove your own admin role.", variant: "destructive" });
      return;
    }

    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Role removed" });
      loadUsers();
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      !userSearch ||
      (u.full_name ?? "").toLowerCase().includes(userSearch.toLowerCase()) ||
      u.id.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (isAdmin === null) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Checking access...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
        <p className="text-muted-foreground">You need admin privileges to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Users", value: stats.totalUsers, icon: Users, color: "text-primary" },
          { label: "Transactions", value: stats.totalTransactions, icon: ArrowDownUp, color: "text-primary" },
          { label: "Categories", value: stats.totalCategories, icon: Tags, color: "text-primary" },
          { label: "Budgets", value: stats.totalBudgets, icon: PiggyBank, color: "text-primary" },
          { label: "Total Income", value: `$${stats.totalIncome.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-500" },
          { label: "Total Expenses", value: `$${stats.totalExpenses.toLocaleString()}`, icon: TrendingDown, color: "text-destructive" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4 pb-3 px-4">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base">Users & Roles</CardTitle>
                  <CardDescription>Manage user accounts and role assignments</CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      className="pl-8 w-48"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Currency</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">
                          {u.full_name || "—"}
                          {u.id === user?.id && (
                            <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                          )}
                        </TableCell>
                        <TableCell>{u.currency}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {u.roles.length === 0 && (
                              <span className="text-xs text-muted-foreground">No roles</span>
                            )}
                            {u.roles.map((role) => (
                              <Badge
                                key={role}
                                variant={role === "admin" ? "default" : "secondary"}
                                className="text-xs cursor-pointer"
                                onClick={() => handleRemoveRole(u.id, role as "admin" | "user")}
                                title="Click to remove"
                              >
                                {role} ×
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(u.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedUserId(u.id);
                              setRoleDialogOpen(true);
                            }}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Recent Transactions (All Users)
              </CardTitle>
              <CardDescription>Latest 20 transactions across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No transactions yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(tx.date), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={tx.type === "income" ? "default" : "destructive"} className="text-xs">
                            {tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{tx.description || "—"}</TableCell>
                        <TableCell className={`text-right font-medium ${tx.type === "income" ? "text-primary" : "text-destructive"}`}>
                          {tx.type === "income" ? "+" : "-"}${Number(tx.amount).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assign Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>Choose a role to assign to this user.</DialogDescription>
          </DialogHeader>
          <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as "admin" | "user")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignRole} disabled={loading}>
              {loading ? "Assigning..." : "Assign Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
