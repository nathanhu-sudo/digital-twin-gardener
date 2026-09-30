import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/sonner";

export type ShoppingItem = { id: string; name: string; checked: boolean };

export function useShoppingList(householdId: string | null) {
  const { user } = useAuth();
  const [items, setItems] = useState<ShoppingItem[]>([]);

  const refresh = useCallback(async () => {
    if (!user) { setItems([]); return; }
    const { data } = await supabase
      .from("shopping_list_items").select("id,name,checked").order("created_at", { ascending: true });
    setItems((data ?? []) as ShoppingItem[]);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh, householdId]);

  const add = useCallback(async (name: string) => {
    if (!user || !name.trim()) return;
    const clean = name.trim().slice(0, 100);
    if (items.some((i) => !i.checked && i.name.toLowerCase() === clean.toLowerCase())) {
      toast.info(`${clean} is already on your list`);
      return;
    }
    const { data, error } = await supabase
      .from("shopping_list_items")
      .insert({ user_id: user.id, name: clean, household_id: householdId })
      .select("id,name,checked").single();
    if (error) { toast.error("Couldn't add to list"); return; }
    setItems((p) => [...p, data as ShoppingItem]);
  }, [user, householdId, items]);

  const toggle = useCallback(async (id: string, checked: boolean) => {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, checked } : i)));
    await supabase.from("shopping_list_items").update({ checked }).eq("id", id);
  }, []);

  const remove = useCallback(async (id: string) => {
    setItems((p) => p.filter((i) => i.id !== id));
    await supabase.from("shopping_list_items").delete().eq("id", id);
  }, []);

  const clearChecked = useCallback(async () => {
    const ids = items.filter((i) => i.checked).map((i) => i.id);
    if (!ids.length) return;
    setItems((p) => p.filter((i) => !i.checked));
    await supabase.from("shopping_list_items").delete().in("id", ids);
  }, [items]);

  return { items, add, toggle, remove, clearChecked, refresh };
}
