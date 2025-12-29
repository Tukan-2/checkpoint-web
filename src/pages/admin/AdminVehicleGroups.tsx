import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Upload, Image } from "lucide-react";

interface VehicleGroup {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  icon_url: string | null;
}

const AdminVehicleGroups = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<VehicleGroup | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
  });
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: vehicleGroups, isLoading } = useQuery({
    queryKey: ["vehicle-groups-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicle_groups")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as VehicleGroup[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; icon: string; icon_url?: string }) => {
      const { error } = await supabase.from("vehicle_groups").insert([{
        name: data.name,
        description: data.description || null,
        icon: data.icon || null,
        icon_url: data.icon_url || null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicle-groups-admin"] });
      setIsOpen(false);
      resetForm();
      toast({ title: "Kategorie vytvořena" });
    },
    onError: (error) => {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; description: string; icon: string; icon_url?: string } }) => {
      const { error } = await supabase.from("vehicle_groups").update({
        name: data.name,
        description: data.description || null,
        icon: data.icon || null,
        icon_url: data.icon_url,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicle-groups-admin"] });
      setIsOpen(false);
      resetForm();
      toast({ title: "Kategorie aktualizována" });
    },
    onError: (error) => {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("vehicle_groups").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicle-groups-admin"] });
      toast({ title: "Kategorie smazána" });
    },
    onError: (error) => {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", description: "", icon: "" });
    setEditingGroup(null);
    setPreviewUrl(null);
  };

  const openEditDialog = (group: VehicleGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || "",
      icon: group.icon || "",
    });
    setPreviewUrl(group.icon_url || null);
    setIsOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Chyba", description: "Vyberte prosím obrázek", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("vehicle-icons")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("vehicle-icons")
        .getPublicUrl(fileName);

      setPreviewUrl(publicUrl);
      toast({ title: "Ikona nahrána" });
    } catch (error: any) {
      toast({ title: "Chyba při nahrávání", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...formData, icon_url: previewUrl || undefined };
    if (editingGroup) {
      updateMutation.mutate({ id: editingGroup.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Kategorie vozidel</h1>
          <p className="text-muted-foreground mt-1">Správa typů vozidel s možností nahrání ikon</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Přidat kategorii
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingGroup ? "Upravit kategorii" : "Nová kategorie vozidel"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Název</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Osobní vozidla, Nákladní vozidla..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Popis</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Volitelný popis kategorie"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Ikona (Lucide název)</Label>
                <Input
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Car, Truck, Bus..."
                />
                <p className="text-xs text-muted-foreground">
                  Název ikony z knihovny Lucide (volitelné)
                </p>
              </div>
              <div className="space-y-2">
                <Label>Vlastní ikona (obrázek)</Label>
                <div className="flex items-center gap-4">
                  {previewUrl ? (
                    <div className="relative w-16 h-16 rounded-lg border border-border overflow-hidden bg-muted">
                      <img src={previewUrl} alt="Ikona" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg border border-dashed border-border flex items-center justify-center bg-muted">
                      <Image className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {uploading ? "Nahrávání..." : "Nahrát obrázek"}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
                  Zrušit
                </Button>
                <Button type="submit">
                  {editingGroup ? "Uložit" : "Vytvořit"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Načítání...</div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ikona</TableHead>
                <TableHead>Název</TableHead>
                <TableHead>Popis</TableHead>
                <TableHead>Lucide ikona</TableHead>
                <TableHead className="text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicleGroups?.map((group) => (
                <TableRow key={group.id}>
                  <TableCell>
                    {group.icon_url ? (
                      <img src={group.icon_url} alt={group.name} className="w-10 h-10 object-contain rounded" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                        <Image className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {group.description || "-"}
                  </TableCell>
                  <TableCell>{group.icon || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(group)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(group.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!vehicleGroups || vehicleGroups.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Žádné kategorie vozidel
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminVehicleGroups;
