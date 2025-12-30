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
import { Plus, Pencil, Trash2 } from "lucide-react";

interface SiteContent {
  id: string;
  section: string;
  key: string;
  title: string | null;
  content: string | null;
  description: string | null;
  order_index: number;
  is_active: boolean;
}

const sections = [
  { value: "hero", label: "Úvodní sekce (Hero)" },
  { value: "about", label: "O nás" },
  { value: "services", label: "Služby" },
  { value: "statistics", label: "Statistiky" },
  { value: "benefits", label: "Benefity / Proč my" },
  { value: "pricing", label: "Ceník" },
  { value: "contact", label: "Kontakt" },
  { value: "footer", label: "Patička" },
];

const AdminContent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<SiteContent | null>(null);
  const [filterSection, setFilterSection] = useState<string>("all");
  const [formData, setFormData] = useState({
    section: "",
    key: "",
    title: "",
    content: "",
    description: "",
    order_index: 0,
    is_active: true,
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: contents, isLoading } = useQuery({
    queryKey: ["site-content"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_content")
        .select("*")
        .order("section")
        .order("order_index");
      if (error) throw error;
      return data as SiteContent[];
    },
  });

  const filteredContents = contents?.filter(
    (c) => filterSection === "all" || c.section === filterSection
  );

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("site_content").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      setIsOpen(false);
      resetForm();
      toast({ title: "Obsah vytvořen" });
    },
    onError: (error) => {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from("site_content").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      setIsOpen(false);
      resetForm();
      toast({ title: "Obsah aktualizován" });
    },
    onError: (error) => {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("site_content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast({ title: "Obsah smazán" });
    },
    onError: (error) => {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      section: "",
      key: "",
      title: "",
      content: "",
      description: "",
      order_index: 0,
      is_active: true,
    });
    setEditingContent(null);
  };

  const openEditDialog = (content: SiteContent) => {
    setEditingContent(content);
    setFormData({
      section: content.section,
      key: content.key,
      title: content.title || "",
      content: content.content || "",
      description: content.description || "",
      order_index: content.order_index,
      is_active: content.is_active,
    });
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContent) {
      updateMutation.mutate({ id: editingContent.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Obsah webu</h1>
          <p className="text-muted-foreground mt-1">Správa textů a obsahu na webu</p>
        </div>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Přidat obsah
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingContent ? "Upravit obsah" : "Nový obsah"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sekce</Label>
                  <Select
                    value={formData.section}
                    onValueChange={(value) => setFormData({ ...formData, section: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte sekci" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Klíč</Label>
                  <Input
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    placeholder="headline, description..."
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Titulek</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Volitelný titulek"
                />
              </div>
              <div className="space-y-2">
                <Label>Obsah</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Text obsahu"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Popis (interní poznámka)</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Popis pro administrátory"
                />
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
                  {editingContent ? "Uložit" : "Vytvořit"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <Select value={filterSection} onValueChange={setFilterSection}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Všechny sekce</SelectItem>
            {sections.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Načítání...</div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sekce</TableHead>
                <TableHead>Klíč</TableHead>
                <TableHead>Titulek</TableHead>
                <TableHead>Obsah</TableHead>
                <TableHead>Aktivní</TableHead>
                <TableHead className="text-right">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContents?.map((content) => (
                <TableRow key={content.id}>
                  <TableCell className="font-medium">
                    {sections.find((s) => s.value === content.section)?.label || content.section}
                  </TableCell>
                  <TableCell>{content.key}</TableCell>
                  <TableCell>{content.title || "-"}</TableCell>
                  <TableCell className="max-w-xs truncate">{content.content || "-"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${content.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {content.is_active ? "Ano" : "Ne"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openEditDialog(content)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(content.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {(!filteredContents || filteredContents.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Žádný obsah
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

export default AdminContent;
