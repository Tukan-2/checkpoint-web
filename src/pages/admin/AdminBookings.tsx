import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, Trash2, Check, X, Clock } from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import type { Branch } from "@/hooks/useBranches";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  confirmed: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  completed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
};

const statusLabels: Record<string, string> = {
  pending: "Čeká",
  confirmed: "Potvrzeno",
  cancelled: "Zrušeno",
  completed: "Dokončeno",
};

const AdminBookings = () => {
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

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

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["admin-bookings", selectedBranch, selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from("bookings")
        .select(`*, branches!inner(*), vehicle_groups!inner(*)`)
        .order("booking_date", { ascending: false });

      if (selectedBranch !== "all") {
        query = query.eq("branch_id", selectedBranch);
      }
      if (selectedStatus !== "all") {
        query = query.eq("status", selectedStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data.map((b: any) => ({
        ...b,
        branch: b.branches,
        vehicle_group: b.vehicle_groups,
      }));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast({ title: "Stav aktualizován" });
    },
    onError: (error: any) => {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bookings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      toast({ title: "Rezervace smazána" });
    },
    onError: (error: any) => {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display text-foreground flex items-center gap-3">
          <CalendarDays className="w-8 h-8 text-accent" />
          Správa rezervací
        </h1>
        <p className="text-muted-foreground mt-1">Přehled a správa všech rezervací</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div>
          <Label>Pobočka</Label>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-48 mt-1.5">
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

        <div>
          <Label>Stav</Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-40 mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Všechny stavy</SelectItem>
              <SelectItem value="pending">Čeká</SelectItem>
              <SelectItem value="confirmed">Potvrzeno</SelectItem>
              <SelectItem value="completed">Dokončeno</SelectItem>
              <SelectItem value="cancelled">Zrušeno</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg" />
          ))}
        </div>
      ) : bookings?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Žádné rezervace k zobrazení.
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Čas</TableHead>
                <TableHead>Pobočka</TableHead>
                <TableHead>Zákazník</TableHead>
                <TableHead>Služba</TableHead>
                <TableHead>Stav</TableHead>
                <TableHead className="w-[150px]">Akce</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings?.map((booking: any) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">
                    {format(new Date(booking.booking_date), "d. MMMM yyyy", { locale: cs })}
                  </TableCell>
                  <TableCell>{booking.booking_time}</TableCell>
                  <TableCell>{booking.branch?.name}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{booking.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{booking.customer_phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{booking.service_name}</p>
                      <p className="text-sm text-muted-foreground">{booking.vehicle_group?.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[booking.status] || ""}>
                      {statusLabels[booking.status] || booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {booking.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "confirmed" })}
                            title="Potvrdit"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "cancelled" })}
                            title="Zrušit"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      {booking.status === "confirmed" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "completed" })}
                          title="Označit jako dokončené"
                        >
                          <Clock className="w-4 h-4 text-blue-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Opravdu chcete smazat tuto rezervaci?")) {
                            deleteMutation.mutate(booking.id);
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

export default AdminBookings;
