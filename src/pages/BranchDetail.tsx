import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Car, Check, ArrowLeft, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useBranch, useBranchVehicleGroups, useBranchPrices, VehicleGroup } from "@/hooks/useBranches";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const timeSlots = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];

const dayNames: Record<string, string> = {
  po: "Pondělí",
  ut: "Úterý",
  st: "Středa",
  ct: "Čtvrtek",
  pa: "Pátek",
  so: "Sobota",
  ne: "Neděle",
};

const BranchDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  
  const { data: branch, isLoading: branchLoading } = useBranch(slug || "");
  const { data: vehicleGroups } = useBranchVehicleGroups(branch?.id || "");
  const { data: prices } = useBranchPrices(branch?.id || "");

  const [selectedVehicleGroup, setSelectedVehicleGroup] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    licensePlate: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const filteredServices = prices?.filter(
    (p) => p.vehicle_group_id === selectedVehicleGroup
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!branch || !selectedVehicleGroup || !selectedService || !selectedDate || !selectedTime) {
      toast({
        title: "Chyba",
        description: "Vyplňte prosím všechna povinná pole.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: bookingData, error } = await supabase.from("bookings").insert({
        branch_id: branch.id,
        vehicle_group_id: selectedVehicleGroup,
        service_name: selectedService,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        license_plate: formData.licensePlate || null,
        booking_date: format(selectedDate, "yyyy-MM-dd"),
        booking_time: selectedTime,
        notes: formData.notes || null,
      }).select().single();

      if (error) throw error;

      // Send email notification
      try {
        await supabase.functions.invoke("send-booking-notification", {
          body: {
            bookingId: bookingData.id,
            cancellationToken: bookingData.cancellation_token,
            customerName: formData.name,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            serviceName: selectedService,
            bookingDate: format(selectedDate, "yyyy-MM-dd"),
            bookingTime: selectedTime,
            branchName: branch.name,
            branchAddress: `${branch.address}, ${branch.postal_code} ${branch.city}`,
            licensePlate: formData.licensePlate || undefined,
            notes: formData.notes || undefined,
          },
        });
        console.log("Booking notification email sent");
      } catch (emailError) {
        console.error("Failed to send notification email:", emailError);
        // Don't fail the booking if email fails
      }

      setIsSubmitted(true);
      toast({
        title: "Rezervace odeslána!",
        description: "Potvrzení jsme vám zaslali na email.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Chyba",
        description: "Nepodařilo se odeslat rezervaci. Zkuste to prosím znovu.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (branchLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4">
            <div className="animate-pulse">
              <div className="h-10 bg-muted rounded w-1/3 mb-4"></div>
              <div className="h-6 bg-muted rounded w-1/4 mb-8"></div>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="h-40 bg-muted rounded"></div>
                  <div className="h-40 bg-muted rounded"></div>
                </div>
                <div className="h-96 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-display text-foreground mb-4">Pobočka nenalezena</h1>
            <Button asChild>
              <Link to="/pobocky">Zpět na seznam poboček</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Back Link */}
          <Link
            to="/pobocky"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Zpět na seznam poboček
          </Link>

          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-display text-foreground mb-2">
              {branch.name}
            </h1>
            <p className="text-muted-foreground text-lg">{branch.description}</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Contact Card */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h2 className="text-xl font-display text-foreground mb-4">Kontakt</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-accent mt-0.5" />
                    <div>
                      <p className="text-foreground">{branch.address}</p>
                      <p className="text-muted-foreground">{branch.postal_code} {branch.city}</p>
                    </div>
                  </div>
                  
                  {branch.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-accent" />
                      <a href={`tel:${branch.phone}`} className="text-foreground hover:text-accent transition-colors">
                        {branch.phone}
                      </a>
                    </div>
                  )}
                  
                  {branch.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-accent" />
                      <a href={`mailto:${branch.email}`} className="text-foreground hover:text-accent transition-colors">
                        {branch.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Opening Hours */}
              {branch.opening_hours && (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h2 className="text-xl font-display text-foreground mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-accent" />
                    Otevírací doba
                  </h2>
                  
                  <div className="space-y-2">
                    {Object.entries(branch.opening_hours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{dayNames[day] || day}</span>
                        <span className="text-foreground font-medium">{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vehicle Groups */}
              {vehicleGroups && vehicleGroups.length > 0 && (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h2 className="text-xl font-display text-foreground mb-4 flex items-center gap-2">
                    <Car className="w-5 h-5 text-accent" />
                    Skupiny vozidel
                  </h2>
                  
                  <div className="space-y-2">
                    {vehicleGroups.map((group) => (
                      <div key={group.id} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-accent" />
                        <span className="text-foreground">{group.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prices */}
              {prices && prices.length > 0 && (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h2 className="text-xl font-display text-foreground mb-4">Ceník</h2>
                  
                  <div className="space-y-4">
                    {vehicleGroups?.map((group) => {
                      const groupPrices = prices.filter((p) => p.vehicle_group_id === group.id);
                      if (groupPrices.length === 0) return null;
                      
                      return (
                        <div key={group.id}>
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            {group.name}
                          </h3>
                          {groupPrices.map((price) => (
                            <div key={price.id} className="flex justify-between text-sm py-1">
                              <span className="text-foreground">{price.service_name}</span>
                              <span className="text-accent font-bold">{price.price} Kč</span>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Booking Form */}
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl p-6 lg:p-8 border border-border">
                <h2 className="text-2xl font-display text-foreground mb-6 flex items-center gap-2">
                  <CalendarDays className="w-6 h-6 text-accent" />
                  Rezervace termínu
                </h2>

                {isSubmitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-accent" />
                    </div>
                    <h3 className="text-2xl font-display text-foreground mb-2">Rezervace odeslána!</h3>
                    <p className="text-muted-foreground mb-6">
                      Děkujeme za vaši rezervaci. Brzy vás budeme kontaktovat pro potvrzení termínu.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsSubmitted(false);
                        setSelectedVehicleGroup("");
                        setSelectedService("");
                        setSelectedDate(undefined);
                        setSelectedTime("");
                        setFormData({ name: "", email: "", phone: "", licensePlate: "", notes: "" });
                      }}
                    >
                      Nová rezervace
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Vehicle Group & Service Selection */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="vehicleGroup">Skupina vozidla *</Label>
                        <Select value={selectedVehicleGroup} onValueChange={setSelectedVehicleGroup}>
                          <SelectTrigger id="vehicleGroup" className="mt-1.5">
                            <SelectValue placeholder="Vyberte skupinu" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicleGroups?.map((group) => (
                              <SelectItem key={group.id} value={group.id}>
                                {group.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="service">Služba *</Label>
                        <Select 
                          value={selectedService} 
                          onValueChange={setSelectedService}
                          disabled={!selectedVehicleGroup}
                        >
                          <SelectTrigger id="service" className="mt-1.5">
                            <SelectValue placeholder="Vyberte službu" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredServices?.map((price) => (
                              <SelectItem key={price.id} value={price.service_name}>
                                {price.service_name} - {price.price} Kč
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Datum *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full mt-1.5 justify-start text-left font-normal">
                              <CalendarDays className="mr-2 h-4 w-4" />
                              {selectedDate ? format(selectedDate, "d. MMMM yyyy", { locale: cs }) : "Vyberte datum"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              disabled={(date) => date < new Date() || date.getDay() === 0}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <Label htmlFor="time">Čas *</Label>
                        <Select value={selectedTime} onValueChange={setSelectedTime}>
                          <SelectTrigger id="time" className="mt-1.5">
                            <SelectValue placeholder="Vyberte čas" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Jméno a příjmení *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefon *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">E-mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <Label htmlFor="licensePlate">SPZ vozidla</Label>
                        <Input
                          id="licensePlate"
                          value={formData.licensePlate}
                          onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                          placeholder="Nepovinné"
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Poznámka</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Další informace k rezervaci..."
                        className="mt-1.5"
                      />
                    </div>

                    <Button 
                      type="submit" 
                      variant="accent" 
                      size="lg" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Odesílání..." : "Odeslat rezervaci"}
                    </Button>
                  </form>
                )}
              </div>

              {/* Map */}
              {branch.map_embed_url && (
                <div className="mt-6 bg-card rounded-2xl overflow-hidden border border-border h-[300px]">
                  <iframe
                    src={branch.map_embed_url}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Mapa ${branch.name}`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BranchDetail;
