import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import type { Branch } from "@/hooks/useBranches";

const AdminBranches = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    address: "",
    city: "",
    postal_code: "",
    phone: "",
    email: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: branches, isLoading } = useQuery({
    queryKey: ["admin-branches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("branches")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Branch[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("branches").insert({
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
        description: data.description || null,
        address: data.address,
        city: data.city,
        postal_code: data.postal_code || null,
        phone: data.phone || null,
        email: data.email || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-branches"] });
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setIsOpen(false);
      resetForm();
      toast({ title: "Pobočka vytvořena" });
    },
    onError: (error: any) => {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("branches")
        .update({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          address: data.address,
          city: data.city,
          postal_code: data.postal_code || null,
          phone: data.phone || null,
          email: data.email || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-branches"] });
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setIsOpen(false);
      setEditingBranch(null);
      resetForm();
      toast({ title: "Pobočka upravena" });
    },
    onError: (error: any) => {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("branches").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-branches"] });
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      toast({ title: "Pobočka smazána" });
    },
    onError: (error: any) => {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      address: "",
      city: "",
      postal_code: "",
      phone: "",
      email: "",
    });
  };

  const openEditDialog = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      slug: branch.slug,
      description: branch.description || "",
      address: branch.address,
      city: branch.city,
      postal_code: branch.postal_code || "",
      phone: branch.phone || "",
      email: branch.email || "",
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBranch) {
      updateMutation.mutate({ id: editingBranch.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-foreground flex items-center gap-3">
            <Building2 className="w-8 h-8 text-accent" />
            Správa poboček
          </h1>
          <p className="text-muted-foreground mt-1">Přidávejte a upravujte pobočky STK</p>
        </div>

        <Dialog open={isOpen} onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setEditingBranch(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button variant="accent">
              <Plus className="w-4 h-4" />
              Přidat pobočku
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingBranch ? "Upravit pobočku" : "Nová pobočka"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Název *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">URL slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generováno"
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Popis</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="address">Adresa *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="postal_code">PSČ</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="city">Město *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  className="mt-1.5"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Zrušit
                </Button>
                <Button type="submit" variant="accent" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingBranch ? "Uložit změny" : "Vytvořit"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg" />
          ))}
        </div>
      ) : branches?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Zatím žádné pobočky. Přidejte první!
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Název</TableHead>
                <TableHead>Město</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead className="w-[100px]">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches?.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell>{branch.city}</TableCell>
                  <TableCell>{branch.phone || "-"}</TableCell>
                  <TableCell>{branch.email || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(branch)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Opravdu chcete smazat tuto pobočku?")) {
                            deleteMutation.mutate(branch.id);
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

export default AdminBranches;
