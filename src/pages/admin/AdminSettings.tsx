import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Settings, Eye, Mail, MapPin } from "lucide-react";

interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
}

const MANAGED_KEYS = ["prices_visible", "contact_email", "contact_address", "contact_branch_note", "contact_phone"];

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: siteSettings, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .order("key");
      if (error) throw error;
      return data as SiteSetting[];
    },
  });

  useEffect(() => {
    if (siteSettings) {
      const settingsMap: Record<string, string> = {};
      siteSettings.forEach((s) => {
        settingsMap[s.key] = s.value || "";
      });
      setSettings(settingsMap);
    }
  }, [siteSettings]);

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("site_settings")
        .update({ value })
        .eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast({ title: "Nastavení uloženo" });
    },
    onError: (error) => {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    },
  });

  const handleSave = (key: string) => {
    updateMutation.mutate({ key, value: settings[key] });
  };

  const handleToggle = (key: string, checked: boolean) => {
    const newValue = checked ? "true" : "false";
    setSettings({ ...settings, [key]: newValue });
    updateMutation.mutate({ key, value: newValue });
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">Načítání...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Nastavení</h1>
        <p className="text-muted-foreground mt-1">Globální nastavení webu</p>
      </div>

      <div className="grid gap-6">
        {/* Zobrazení cen */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent rounded-lg">
                <Eye className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <CardTitle>Zobrazení ceníku</CardTitle>
                <CardDescription>Nastavte, zda má být ceník viditelný na webu</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Zobrazit ceník</p>
                <p className="text-sm text-muted-foreground">
                  Pokud je vypnuto, sekce ceníku nebude na webu viditelná
                </p>
              </div>
              <Switch
                checked={settings.prices_visible === "true"}
                onCheckedChange={(checked) => handleToggle("prices_visible", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Kontaktní údaje */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent rounded-lg">
                <MapPin className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <CardTitle>Kontaktní údaje</CardTitle>
                <CardDescription>Údaje zobrazené v kontaktní sekci na webu</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Kontaktní email</Label>
              <div className="flex gap-2">
                <Input
                  value={settings.contact_email || ""}
                  onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                  placeholder="info@example.cz"
                />
                <Button variant="outline" size="icon" onClick={() => handleSave("contact_email")}>
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Sídlo firmy</Label>
              <div className="flex gap-2">
                <Input
                  value={settings.contact_address || ""}
                  onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
                  placeholder="Ulice 123, 110 00 Praha"
                />
                <Button variant="outline" size="icon" onClick={() => handleSave("contact_address")}>
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Poznámka o kontaktech poboček</Label>
              <div className="flex gap-2">
                <Textarea
                  value={settings.contact_branch_note || ""}
                  onChange={(e) => setSettings({ ...settings, contact_branch_note: e.target.value })}
                  placeholder="Kontakty na jednotlivé pobočky najdete..."
                  rows={2}
                />
                <Button variant="outline" size="icon" className="flex-shrink-0" onClick={() => handleSave("contact_branch_note")}>
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ostatní nastavení */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent rounded-lg">
                <Settings className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <CardTitle>Ostatní nastavení</CardTitle>
                <CardDescription>Další konfigurace webu</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {siteSettings
                ?.filter((s) => !MANAGED_KEYS.includes(s.key))
                .map((setting) => (
                  <div key={setting.id} className="space-y-2">
                    <Label>{setting.description || setting.key}</Label>
                    <div className="flex gap-2">
                      <Input
                        value={settings[setting.key] || ""}
                        onChange={(e) => setSettings({ ...settings, [setting.key]: e.target.value })}
                      />
                      <Button variant="outline" size="icon" onClick={() => handleSave(setting.key)}>
                        <Save className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              {siteSettings?.filter((s) => !MANAGED_KEYS.includes(s.key)).length === 0 && (
                <p className="text-muted-foreground text-center py-4">Žádná další nastavení</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSettings;
