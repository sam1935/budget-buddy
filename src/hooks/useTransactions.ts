import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useTransactions(type?: "income" | "expense") {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["transactions", type],
    queryFn: async () => {
      let q = supabase
        .from("transactions")
        .select("*, categories(name, color, icon)")
        .order("date", { ascending: false });
      if (type) q = q.eq("type", type);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const addTransaction = useMutation({
    mutationFn: async (tx: {
      type: "income" | "expense";
      amount: number;
      description?: string;
      notes?: string;
      category_id?: string;
      date?: string;
      is_recurring?: boolean;
      recurring_interval?: string;
    }) => {
      const { error } = await supabase.from("transactions").insert({
        ...tx,
        user_id: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction added");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateTransaction = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; [key: string]: any }) => {
      const { error } = await supabase.from("transactions").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction updated");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction deleted");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return { ...query, addTransaction, updateTransaction, deleteTransaction };
}
