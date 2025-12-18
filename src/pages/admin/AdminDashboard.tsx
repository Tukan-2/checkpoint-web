import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Building2, DollarSign, CalendarDays, Users, ArrowRight } from "lucide-react";

const AdminDashboard = () => {
  const { data: branchesCount } = useQuery({
    queryKey: ["admin-branches-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("branches")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: bookingsCount } = useQuery({
    queryKey: ["admin-bookings-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: pricesCount } = useQuery({
    queryKey: ["admin-prices-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("branch_prices")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const stats = [
    {
      name: "Pobočky",
      value: branchesCount ?? 0,
      icon: Building2,
      href: "/admin/branches",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      name: "Čekající rezervace",
      value: bookingsCount ?? 0,
      icon: CalendarDays,
      href: "/admin/bookings",
      color: "bg-orange-500/10 text-orange-600",
    },
    {
      name: "Položky ceníku",
      value: pricesCount ?? 0,
      icon: DollarSign,
      href: "/admin/prices",
      color: "bg-green-500/10 text-green-600",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-display text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Přehled administrace STK</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="bg-card rounded-xl p-6 border border-border hover:border-accent/30 transition-colors group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
            <p className="text-3xl font-display text-foreground">{stat.value}</p>
            <p className="text-muted-foreground">{stat.name}</p>
          </Link>
        ))}
      </div>

      <div className="bg-card rounded-xl p-6 border border-border">
        <h2 className="text-xl font-display text-foreground mb-4">Rychlé akce</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/admin/branches"
            className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <Building2 className="w-5 h-5 text-accent" />
            <span>Přidat pobočku</span>
          </Link>
          <Link
            to="/admin/prices"
            className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <DollarSign className="w-5 h-5 text-accent" />
            <span>Upravit ceník</span>
          </Link>
          <Link
            to="/admin/bookings"
            className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <CalendarDays className="w-5 h-5 text-accent" />
            <span>Zobrazit rezervace</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
