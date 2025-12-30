import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SiteContent {
  id: string;
  section: string;
  key: string;
  title: string | null;
  content: string | null;
  description: string | null;
  order_index: number | null;
  is_active: boolean | null;
}

export const useSiteContent = (section?: string) => {
  return useQuery({
    queryKey: ["site-content", section],
    queryFn: async () => {
      let query = supabase
        .from("site_content")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (section) {
        query = query.eq("section", section);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SiteContent[];
    },
  });
};

export const useAllSiteContent = () => {
  return useQuery({
    queryKey: ["site-content-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .eq("is_active", true)
        .order("section", { ascending: true })
        .order("order_index", { ascending: true });

      if (error) throw error;

      // Group by section for easy access
      const grouped: Record<string, Record<string, SiteContent>> = {};
      (data as SiteContent[]).forEach((item) => {
        if (!grouped[item.section]) {
          grouped[item.section] = {};
        }
        grouped[item.section][item.key] = item;
      });

      return grouped;
    },
  });
};

// Helper to get content value with fallback
export const getContent = (
  content: Record<string, Record<string, SiteContent>> | undefined,
  section: string,
  key: string,
  field: "content" | "title" = "content",
  fallback: string = ""
): string => {
  return content?.[section]?.[key]?.[field] ?? fallback;
};
