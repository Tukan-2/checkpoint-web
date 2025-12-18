import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Branch {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  opening_hours: Record<string, string> | null;
  map_embed_url: string | null;
}

export interface VehicleGroup {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
}

export interface BranchPrice {
  id: string;
  branch_id: string;
  vehicle_group_id: string;
  service_name: string;
  price: number;
  description: string | null;
  vehicle_group?: VehicleGroup;
}

export const useBranches = () => {
  return useQuery({
    queryKey: ["branches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as Branch[];
    },
  });
};

export const useBranch = (slug: string) => {
  return useQuery({
    queryKey: ["branch", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      
      if (error) throw error;
      return data as Branch | null;
    },
    enabled: !!slug,
  });
};

export const useBranchVehicleGroups = (branchId: string) => {
  return useQuery({
    queryKey: ["branch-vehicle-groups", branchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branch_vehicle_groups")
        .select(`
          vehicle_group_id,
          vehicle_groups (*)
        `)
        .eq("branch_id", branchId);
      
      if (error) throw error;
      return data.map((d: any) => d.vehicle_groups) as VehicleGroup[];
    },
    enabled: !!branchId,
  });
};

export const useBranchPrices = (branchId: string) => {
  return useQuery({
    queryKey: ["branch-prices", branchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branch_prices")
        .select(`
          *,
          vehicle_groups (*)
        `)
        .eq("branch_id", branchId);
      
      if (error) throw error;
      return data.map((d: any) => ({
        ...d,
        vehicle_group: d.vehicle_groups,
      })) as BranchPrice[];
    },
    enabled: !!branchId,
  });
};

export const useVehicleGroups = () => {
  return useQuery({
    queryKey: ["vehicle-groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_groups")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as VehicleGroup[];
    },
  });
};
