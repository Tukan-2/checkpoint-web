import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Service {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  duration_minutes: number | null;
  concurrent_slots: number | null;
  price: number | null;
  is_active: boolean | null;
  order_index: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export const useServices = () => {
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as Service[];
    },
  });
};
