import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Clock, Calendar, Navigation, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBranches } from "@/hooks/useBranches";
import { toast } from "sonner";

// Approximate coordinates for Czech cities
const cityCoordinates: Record<string, { lat: number; lon: number }> = {
  "praha": { lat: 50.0755, lon: 14.4378 },
  "praha 10": { lat: 50.0755, lon: 14.4378 },
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

// Get next available date (skip weekends)
const getNextAvailableDate = (): { date: Date; dayName: string } => {
  const now = new Date();
  let checkDate = new Date(now);
  
  // If it's past 4 PM, start from tomorrow
  if (now.getHours() >= 16) {
    checkDate.setDate(checkDate.getDate() + 1);
  }
  
  // Skip weekends
  while (checkDate.getDay() === 0 || checkDate.getDay() === 6) {
    checkDate.setDate(checkDate.getDate() + 1);
  }
  
  const days = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];
  const dayName = days[checkDate.getDay()];
  
  return { date: checkDate, dayName };
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' });
};

const NearestBranchSection = () => {
  const navigate = useNavigate();
  const { data: branches, isLoading: branchesLoading } = useBranches();
  const [isLocating, setIsLocating] = useState(false);
  const [nearestBranch, setNearestBranch] = useState<typeof branches[0] | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [locationError, setLocationError] = useState(false);
  const [hasAttemptedLocation, setHasAttemptedLocation] = useState(false);

  const findNearestBranch = (userLat: number, userLon: number) => {
    if (!branches || branches.length === 0) {
      return null;
    }

    let nearest = branches[0];
    let shortestDistance = Infinity;

    branches.forEach((branch) => {
      const cityName = branch.city.toLowerCase();
      const coords = cityCoordinates[cityName];
      
      if (coords) {
        const dist = calculateDistance(userLat, userLon, coords.lat, coords.lon);
        if (dist < shortestDistance) {
          shortestDistance = dist;
          nearest = branch;
        }
      }
    });

    setDistance(Math.round(shortestDistance));
    return nearest;
  };

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(true);
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        setHasAttemptedLocation(true);
        const { latitude, longitude } = position.coords;
        const nearest = findNearestBranch(latitude, longitude);
        if (nearest) {
          setNearestBranch(nearest);
        }
      },
      (error) => {
        setIsLocating(false);
        setHasAttemptedLocation(true);
        setLocationError(true);
        console.error("Geolocation error:", error);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  // Try to get location on component mount
  useEffect(() => {
    if (branches && branches.length > 0 && !hasAttemptedLocation) {
      // Small delay to not be too aggressive
      const timer = setTimeout(() => {
        requestLocation();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [branches, hasAttemptedLocation]);

  const nextAvailable = getNextAvailableDate();

  if (branchesLoading) {
    return null;
  }

  // If we have a nearest branch, show it
  if (nearestBranch) {
    return (
      <section className="py-16 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-2xl border border-border p-6 lg:p-8 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                {/* Location Icon & Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-accent mb-2">
                    <MapPin className="w-5 h-5" />
                    <span className="text-sm font-medium">Nejbližší pobočka</span>
                    {distance && (
                      <span className="text-muted-foreground text-sm">
                        ({distance} km od vás)
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                    {nearestBranch.name}
                  </h3>
                  <p className="text-muted-foreground">
                    {nearestBranch.address}, {nearestBranch.city}
                  </p>
                </div>

                {/* Next Available Appointment */}
                <div className="lg:border-l lg:border-border lg:pl-6">
                  <div className="flex items-center gap-2 text-accent mb-2">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm font-medium">Nejbližší termín</span>
                  </div>
                  <p className="text-xl font-semibold text-foreground">
                    {nextAvailable.dayName}
                  </p>
                  <p className="text-muted-foreground">
                    {formatDate(nextAvailable.date)}
                  </p>
                </div>

                {/* CTA Button */}
                <div className="lg:ml-auto">
                  <Button size="lg" className="w-full lg:w-auto gap-2" asChild>
                    <Link to={`/pobocky/${nearestBranch.slug}`}>
                      Objednat se
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // If location is being detected or failed, show prompt
  if (!hasAttemptedLocation || isLocating) {
    return (
      <section className="py-16 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
              <Navigation className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                {isLocating ? "Zjišťuji vaši polohu..." : "Najděte nejbližší pobočku"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {isLocating 
                  ? "Počkejte prosím, zjišťujeme nejbližší pobočku a dostupný termín."
                  : "Povolte přístup k poloze a my vám najdeme nejbližší STK stanici s nejbližším volným termínem."
                }
              </p>
              {!isLocating && (
                <Button onClick={requestLocation} size="lg" className="gap-2">
                  <Navigation className="w-4 h-4" />
                  Povolit polohu
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // If location failed, show branch selection
  if (locationError) {
    return (
      <section className="py-16 bg-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                Vyberte si pobočku
              </h3>
              <p className="text-muted-foreground mb-6">
                Nepodařilo se zjistit vaši polohu. Vyberte si pobočku ze seznamu.
              </p>
              <Button asChild size="lg">
                <Link to="/pobocky">Zobrazit všechny pobočky</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return null;
};

export default NearestBranchSection;
