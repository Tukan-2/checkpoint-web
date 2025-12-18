import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, DollarSign } from "lucide-react";
import type { Branch, VehicleGroup, BranchPrice } from "@/hooks/useBranches";

const AdminPrices = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<BranchPrice | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [formData, setFormData] = useState({
    branch_id: "",
    vehicle_group_id: "",
    service_name: "",
    price: "",
    description: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: branches } = useQuery({
    queryKey: ["admin-branches"],
    queryFn: async () => {
      const { data, error } = await supabase.from("branches").select("*").order("name");
      if (error) throw error;
      return data as Branch[];
    },
  });

  const { data: vehicleGroups } = useQuery({
    queryKey: ["vehicle-groups"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicle_groups").select("*").order("name");
      if (error) throw error;
      return data as VehicleGroup[];
    },
  });

  const { data: prices, isLoading } = useQuery({
    queryKey: ["admin-prices", selectedBranch],
    queryFn: async () => {
      let query = supabase
        .from("branch_prices")
        .select(`*, branches!inner(*), vehicle_groups!inner(*)`);
      
      if (selectedBranch !== "all") {
        query = query.eq("branch_id", selectedBranch);
      }

      const { data, error } = await query.order("service_name");
      if (error) throw error;
      return data.map((p: any) => ({
        ...p,
        branch: p.branches,
        vehicle_group: p.vehicle_groups,
      }));
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("branch_prices").insert({
        branch_id: data.branch_id,
        vehicle_group_id: data.vehicle_group_id,
        service_name: data.service_name,
        price: parseInt(data.price),
        description: data.description || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-prices"] });
      setIsOpen(false);
      resetForm();
      toast({ title: "Ceník vytvořen" });
    },
    onError: (error: any) => {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("branch_prices")
        .update({
          branch_id: data.branch_id,
          vehicle_group_id: data.vehicle_group_id,
          service_name: data.service_name,
          price: parseInt(data.price),
          description: data.description || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-prices"] });
      setIsOpen(false);
      setEditingPrice(null);
      resetForm();
      toast({ title: "Ceník upraven" });
    },
    onError: (error: any) => {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("branch_prices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-prices"] });
      toast({ title: "Položka smazána" });
    },
    onError: (error: any) => {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      branch_id: "",
      vehicle_group_id: "",
      service_name: "",
      price: "",
      description: "",
    });
  };

  const openEditDialog = (price: any) => {
    setEditingPrice(price);
    setFormData({
      branch_id: price.branch_id,
      vehicle_group_id: price.vehicle_group_id,
      service_name: price.service_name,
      price: price.price.toString(),
      description: price.description || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPrice) {
      updateMutation.mutate({ id: editingPrice.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-foreground flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-accent" />
            Správa ceníku
          </h1>
          <p className="text-muted-foreground mt-1">Nastavte ceny služeb pro jednotlivé pobočky</p>
        </div>

        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setEditingPrice(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button variant="accent">
              <Plus className="w-4 h-4" />
              Přidat položku
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPrice ? "Upravit položku" : "Nová položka ceníku"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Pobočka *</Label>
                <Select
                  value={formData.branch_id}
                  onValueChange={(val) => setFormData({ ...formData, branch_id: val })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Vyberte pobočku" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches?.map((b) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Skupina vozidel *</Label>
                <Select
                  value={formData.vehicle_group_id}
                  onValueChange={(val) => setFormData({ ...formData, vehicle_group_id: val })}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Vyberte skupinu" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicleGroups?.map((vg) => (
                      <SelectItem key={vg.id} value={vg.id}>{vg.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="service_name">Název služby *</Label>
                  <Input
                    id="service_name"
                    value={formData.service_name}
                    onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                    placeholder="STK, Emise..."
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="price">Cena (Kč) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Popis</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Zrušit
                </Button>
                <Button type="submit" variant="accent" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingPrice ? "Uložit změny" : "Vytvořit"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <Label>Filtrovat podle pobočky</Label>
        <Select value={selectedBranch} onValueChange={setSelectedBranch}>
          <SelectTrigger className="w-64 mt-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všechny pobočky</SelectItem>
            {branches?.map((b) => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg" />
          ))}
        </div>
      ) : prices?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Zatím žádné položky ceníku.
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pobočka</TableHead>
                <TableHead>Skupina vozidel</TableHead>
                <TableHead>Služba</TableHead>
                <TableHead>Cena</TableHead>
                <TableHead className="w-[100px]">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prices?.map((price: any) => (
                <TableRow key={price.id}>
                  <TableCell>{price.branch?.name}</TableCell>
                  <TableCell>{price.vehicle_group?.name}</TableCell>
                  <TableCell className="font-medium">{price.service_name}</TableCell>
                  <TableCell className="font-bold text-accent">{price.price} Kč</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(price)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Opravdu chcete smazat tuto položku?")) {
                            deleteMutation.mutate(price.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminPrices;
