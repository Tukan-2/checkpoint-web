import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Phone, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBranches } from "@/hooks/useBranches";
import { toast } from "sonner";

// Helper function to calculate distance between two points using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Approximate coordinates for Czech cities (for finding nearest branch)
const cityCoordinates: Record<string, { lat: number; lon: number }> = {
  "praha": { lat: 50.0755, lon: 14.4378 },
  "brno": { lat: 49.1951, lon: 16.6068 },
  "ostrava": { lat: 49.8209, lon: 18.2625 },
  "plzeň": { lat: 49.7384, lon: 13.3736 },
  "liberec": { lat: 50.7671, lon: 15.0562 },
  "olomouc": { lat: 49.5938, lon: 17.2509 },
  "české budějovice": { lat: 48.9745, lon: 14.4743 },
  "hradec králové": { lat: 50.2092, lon: 15.8327 },
  "ústí nad labem": { lat: 50.6607, lon: 14.0323 },
  "pardubice": { lat: 50.0343, lon: 15.7812 },
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";
  const { data: branches } = useBranches();

  const navLinks = [
    { name: "Služby", href: "#sluzby", isHash: true },
    { name: "Pobočky", href: "/pobocky", isHash: false },
    { name: "O nás", href: "#o-nas", isHash: true },
    // { name: "Ceník", href: "#cenik", isHash: true }, // Temporarily disabled
    { name: "Rezervace", href: "gps-booking", isHash: false, isGps: true },
    { name: "Kontakt", href: "#kontakt", isHash: true },
  ];

  const findNearestBranch = (userLat: number, userLon: number) => {
    if (!branches || branches.length === 0) {
      toast.error("Nepodařilo se načíst pobočky");
      return null;
    }

    let nearestBranch = branches[0];
    let shortestDistance = Infinity;

    branches.forEach((branch) => {
      const cityName = branch.city.toLowerCase();
      const coords = cityCoordinates[cityName];
      
      if (coords) {
        const distance = calculateDistance(userLat, userLon, coords.lat, coords.lon);
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestBranch = branch;
        }
      }
    });

    return nearestBranch;
  };

  const handleGpsBooking = () => {
    if (!navigator.geolocation) {
      toast.error("Váš prohlížeč nepodporuje geolokaci");
      navigate("/pobocky");
      return;
    }

    setIsLocating(true);
    toast.info("Zjišťuji vaši polohu...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        const nearestBranch = findNearestBranch(latitude, longitude);
        
        if (nearestBranch) {
          toast.success(`Nejbližší pobočka: ${nearestBranch.name}`);
          navigate(`/pobocky/${nearestBranch.slug}`);
        } else {
          navigate("/pobocky");
        }
        setIsOpen(false);
      },
      (error) => {
        setIsLocating(false);
        console.error("Geolocation error:", error);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Přístup k poloze byl zamítnut. Zobrazuji všechny pobočky.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Poloha není dostupná. Zobrazuji všechny pobočky.");
            break;
          case error.TIMEOUT:
            toast.error("Časový limit pro zjištění polohy vypršel.");
            break;
          default:
            toast.error("Nepodařilo se zjistit polohu.");
        }
        navigate("/pobocky");
        setIsOpen(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  };

  const renderNavLink = (link: typeof navLinks[0] & { isGps?: boolean }) => {
    if (link.isGps) {
      return (
        <button
          key={link.name}
          onClick={handleGpsBooking}
          disabled={isLocating}
          className="flex items-center gap-1 text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium disabled:opacity-50"
        >
          <Navigation className="w-4 h-4" />
          {isLocating ? "Hledám..." : link.name}
        </button>
      );
    }
    if (link.isHash) {
      if (isHomePage) {
        return (
          <a
            key={link.name}
            href={link.href}
            className="text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium"
          >
            {link.name}
          </a>
        );
      } else {
        return (
          <Link
            key={link.name}
            to={`/${link.href}`}
            className="text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium"
          >
            {link.name}
          </Link>
        );
      }
    } else {
      return (
        <Link
          key={link.name}
          to={link.href}
          className="text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium"
        >
          {link.name}
        </Link>
      );
    }
  };

  const renderMobileNavLink = (link: typeof navLinks[0] & { isGps?: boolean }) => {
    if (link.isGps) {
      return (
        <button
          key={link.name}
          onClick={handleGpsBooking}
          disabled={isLocating}
          className="flex items-center gap-2 py-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium disabled:opacity-50 w-full text-left"
        >
          <Navigation className="w-4 h-4" />
          {isLocating ? "Hledám nejbližší pobočku..." : link.name}
        </button>
      );
    }
    if (link.isHash && isHomePage) {
      return (
        <a
          key={link.name}
          href={link.href}
          className="block py-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium"
          onClick={() => setIsOpen(false)}
        >
          {link.name}
        </a>
      );
    } else {
      return (
        <Link
          key={link.name}
          to={link.isHash ? `/${link.href}` : link.href}
          className="block py-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium"
          onClick={() => setIsOpen(false)}
        >
          {link.name}
        </Link>
      );
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm border-b border-primary-foreground/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-display font-bold text-xl">STK</span>
            </div>
            <span className="text-primary-foreground font-display text-xl hidden sm:block">
              AutoKontrol
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(renderNavLink)}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <a href="tel:+420123456789" className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground">
              <Phone className="w-4 h-4" />
              <span className="font-semibold">+420 123 456 789</span>
            </a>
            <Button variant="accent" size="default" asChild>
              <Link to="/pobocky">Objednat se</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-primary-foreground p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-primary-foreground/10">
            {navLinks.map(renderMobileNavLink)}
            <div className="pt-4 mt-4 border-t border-primary-foreground/10">
              <a href="tel:+420123456789" className="flex items-center gap-2 text-primary-foreground/80 mb-4">
                <Phone className="w-4 h-4" />
                <span className="font-semibold">+420 123 456 789</span>
              </a>
              <Button variant="accent" className="w-full" asChild>
                <Link to="/pobocky" onClick={() => setIsOpen(false)}>Objednat se</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
