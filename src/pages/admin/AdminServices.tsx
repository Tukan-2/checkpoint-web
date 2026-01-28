import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Clock, Users } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  duration_minutes: number | null;
  concurrent_slots: number | null;
  price: number | null;
  is_active: boolean | null;
  order_index: number | null;
}

const iconOptions = [
  { value: "Car", label: "Auto (Car)" },
  { value: "Gauge", label: "Tachometr (Gauge)" },
  { value: "FileCheck", label: "Kontrola (FileCheck)" },
  { value: "Wrench", label: "Klíč (Wrench)" },
  { value: "AlertTriangle", label: "Varování (AlertTriangle)" },
  { value: "CheckCircle", label: "OK (CheckCircle)" },
];

const AdminServices = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "Car",
    duration_minutes: 30,
    concurrent_slots: 1,
    price: 0,
    is_active: true,
    order_index: 0,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services, isLoading } = useQuery({
    queryKey: ["admin-services"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as Service[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("services").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setIsOpen(false);
      resetForm();
      toast({ title: "Služba vytvořena" });
    },
    onError: (error) => {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from("services").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setIsOpen(false);
      resetForm();
      toast({ title: "Služba aktualizována" });
    },
    onError: (error) => {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast({ title: "Služba smazána" });
    },
    onError: (error) => {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "Car",
      duration_minutes: 30,
      concurrent_slots: 1,
      price: 0,
      is_active: true,
      order_index: 0,
    });
    setEditingService(null);
  };

  const openEditDialog = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      icon: service.icon || "Car",
      duration_minutes: service.duration_minutes || 30,
      concurrent_slots: service.concurrent_slots || 1,
      price: service.price || 0,
      is_active: service.is_active ?? true,
      order_index: service.order_index || 0,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      updateMutation.mutate({ id: editingService.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "-";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours} hod`;
    return `${hours} hod ${remainingMinutes} min`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Služby (Úkony)</h1>
          <p className="text-muted-foreground mt-1">Správa služeb s dobou trvání a kapacitou</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Přidat službu
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingService ? "Upravit službu" : "Nová služba"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Název služby *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Název služby"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Popis</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Popis služby"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ikona</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => setFormData({ ...formData, icon: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte ikonu" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cena (Kč)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    placeholder="800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Doba trvání (minuty)
                  </Label>
                  <Input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 30 })}
                    placeholder="30"
                    min={1}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Souběžné sloty
                  </Label>
                  <Input
                    type="number"
                    value={formData.concurrent_slots}
                    onChange={(e) => setFormData({ ...formData, concurrent_slots: parseInt(e.target.value) || 1 })}
                    placeholder="1"
                    min={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Kolik stejných služeb lze provádět současně
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pořadí</Label>
                  <Input
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label>Aktivní</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => { setIsOpen(false); resetForm(); }}>
                  Zrušit
                </Button>
                <Button type="submit">
                  {editingService ? "Uložit" : "Vytvořit"}
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
                <TableHead>Pořadí</TableHead>
                <TableHead>Název</TableHead>
                <TableHead>Doba trvání</TableHead>
                <TableHead>Souběžné sloty</TableHead>
                <TableHead>Cena</TableHead>
                <TableHead>Aktivní</TableHead>
                <TableHead className="text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services?.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>{service.order_index}</TableCell>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {formatDuration(service.duration_minutes)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      {service.concurrent_slots || 1}
                    </span>
                  </TableCell>
                  <TableCell>
                    {service.price ? `${service.price.toLocaleString('cs-CZ')} Kč` : "-"}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${service.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {service.is_active ? "Ano" : "Ne"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(service)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(service.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!services || services.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Žádné služby
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

export default AdminServices;
