import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
}

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*");

      if (error) throw error;

      // Convert to key-value map for easy access
      const settingsMap: Record<string, string | null> = {};
      (data as SiteSetting[]).forEach((item) => {
        settingsMap[item.key] = item.value;
      });

      return settingsMap;
    },
  });
};

// Helper to get setting value with fallback
export const getSetting = (
  settings: Record<string, string | null> | undefined,
  key: string,
  fallback: string = ""
): string => {
  return settings?.[key] ?? fallback;
};

// Helper to check boolean setting
export const isSettingEnabled = (
  settings: Record<string, string | null> | undefined,
  key: string,
  defaultValue: boolean = false
): boolean => {
  const value = settings?.[key];
  if (value === null || value === undefined) return defaultValue;
  return value === "true";
};
