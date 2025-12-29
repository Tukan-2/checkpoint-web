import { useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { Building2, DollarSign, CalendarDays, LogOut, Home, FileText, Menu, Settings, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { name: "Pobočky", href: "/admin/branches", icon: Building2 },
  { name: "Kategorie vozidel", href: "/admin/vehicle-groups", icon: Car },
  { name: "Ceník", href: "/admin/prices", icon: DollarSign },
  { name: "Rezervace", href: "/admin/bookings", icon: CalendarDays },
  { name: "Obsah webu", href: "/admin/content", icon: FileText },
  { name: "Menu", href: "/admin/menu", icon: Menu },
  { name: "Nastavení", href: "/admin/settings", icon: Settings },
];

const AdminLayout = () => {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && user && !isAdmin) {
      toast({
        title: "Přístup odepřen",
        description: "Nemáte oprávnění administrátora.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [user, loading, isAdmin, navigate, toast]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Načítání...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-display font-bold text-lg">STK</span>
            </div>
            <div>
              <span className="font-display text-lg text-foreground">Admin</span>
              <p className="text-xs text-muted-foreground">Správa STK</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Home className="w-5 h-5" />
            Zpět na web
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Odhlásit se
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
