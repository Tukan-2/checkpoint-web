import { useState } from "react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { CalendarIcon, Check, Clock, User, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const services = [
  { id: "stk-osobni", name: "STK osobního vozidla", price: "800 Kč", duration: "45 min" },
  { id: "emise", name: "Měření emisí", price: "400 Kč", duration: "20 min" },
  { id: "evidencni", name: "Evidenční kontrola", price: "300 Kč", duration: "15 min" },
  { id: "stk-nakladni", name: "STK nákladního vozidla", price: "1200 Kč", duration: "60 min" },
];

const timeSlots = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00",
];

const BookingSection = () => {
  const [selectedService, setSelectedService] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedServiceData = services.find((s) => s.id === selectedService);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedDate || !selectedTime || !name || !phone) {
      toast({
        title: "Vyplňte všechna povinná pole",
        description: "Vyberte službu, datum, čas a vyplňte kontaktní údaje.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitted(true);
    toast({
      title: "Rezervace odeslána!",
      description: "Potvrzení jsme vám zaslali na e-mail.",
    });
  };

  const resetForm = () => {
    setSelectedService("");
    setSelectedDate(undefined);
    setSelectedTime("");
    setName("");
    setPhone("");
    setEmail("");
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <section id="rezervace" className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-display text-foreground mb-4">
              Rezervace potvrzena!
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Děkujeme za vaši rezervaci. Potvrzení jsme zaslali na váš e-mail.
            </p>
            
            <div className="bg-card rounded-2xl p-6 lg:p-8 card-elevated border border-border text-left mb-8">
              <h3 className="font-display text-xl text-foreground mb-4">Detail rezervace</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Služba:</span>
                  <span className="text-foreground font-medium">{selectedServiceData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Datum:</span>
                  <span className="text-foreground font-medium">
                    {selectedDate && format(selectedDate, "d. MMMM yyyy", { locale: cs })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Čas:</span>
                  <span className="text-foreground font-medium">{selectedTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Jméno:</span>
                  <span className="text-foreground font-medium">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Telefon:</span>
                  <span className="text-foreground font-medium">{phone}</span>
                </div>
                {email && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">E-mail:</span>
                    <span className="text-foreground font-medium">{email}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-border flex justify-between">
                  <span className="text-muted-foreground">Cena:</span>
                  <span className="text-accent font-bold text-lg">{selectedServiceData?.price}</span>
                </div>
              </div>
            </div>

            <Button variant="accent" size="lg" onClick={resetForm}>
              Nová rezervace
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="rezervace" className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-accent font-semibold uppercase tracking-wider text-sm">Online rezervace</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-foreground mt-2 mb-4">
            Objednejte se online
          </h2>
          <p className="text-muted-foreground text-lg">
            Vyberte si službu, datum a čas, který vám vyhovuje. Rezervace trvá méně než minutu.
          </p>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Service & Time Selection */}
            <div className="space-y-6">
              {/* Service Selection */}
              <div className="bg-card rounded-2xl p-6 card-elevated border border-border">
                <Label className="text-foreground font-display text-lg mb-4 block">1. Vyberte službu</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="w-full h-12 bg-background">
                    <SelectValue placeholder="Vyberte službu..." />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex items-center justify-between w-full gap-4">
                          <span>{service.name}</span>
                          <span className="text-muted-foreground text-sm">{service.price}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedServiceData && (
                  <div className="mt-4 p-4 bg-accent/10 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground font-medium">{selectedServiceData.name}</span>
                      <span className="text-accent font-bold">{selectedServiceData.price}</span>
                    </div>
                    <p className="text-muted-foreground text-sm mt-1">
                      Doba trvání: {selectedServiceData.duration}
                    </p>
                  </div>
                )}
              </div>

              {/* Date Selection */}
              <div className="bg-card rounded-2xl p-6 card-elevated border border-border">
                <Label className="text-foreground font-display text-lg mb-4 block">2. Vyberte datum</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal bg-background",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "d. MMMM yyyy", { locale: cs }) : "Vyberte datum..."}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date.getDay() === 0}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Time Selection */}
              <div className="bg-card rounded-2xl p-6 card-elevated border border-border">
                <Label className="text-foreground font-display text-lg mb-4 block">
                  <Clock className="w-5 h-5 inline mr-2" />
                  3. Vyberte čas
                </Label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        "py-2 px-3 rounded-lg text-sm font-medium transition-all",
                        selectedTime === time
                          ? "bg-accent text-accent-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Contact Info */}
            <div className="space-y-6">
              <div className="bg-card rounded-2xl p-6 card-elevated border border-border">
                <Label className="text-foreground font-display text-lg mb-4 block">4. Kontaktní údaje</Label>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Jméno a příjmení *
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Jan Novák"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="h-12 bg-background"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Telefon *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+420 123 456 789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-12 bg-background"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-muted-foreground text-sm mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      E-mail (volitelné)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jan@email.cz"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 bg-background"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-primary rounded-2xl p-6 text-primary-foreground">
                <h3 className="font-display text-xl mb-4">Shrnutí rezervace</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-primary-foreground/70">Služba:</span>
                    <span>{selectedServiceData?.name || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-foreground/70">Datum:</span>
                    <span>{selectedDate ? format(selectedDate, "d. M. yyyy", { locale: cs }) : "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-primary-foreground/70">Čas:</span>
                    <span>{selectedTime || "—"}</span>
                  </div>
                  <div className="pt-3 mt-3 border-t border-primary-foreground/20 flex justify-between text-lg font-bold">
                    <span>Cena:</span>
                    <span className="text-accent">{selectedServiceData?.price || "—"}</span>
                  </div>
                </div>
              </div>

              <Button type="submit" variant="accent" size="xl" className="w-full">
                Odeslat rezervaci
              </Button>
              
              <p className="text-muted-foreground text-xs text-center">
                * Povinná pole. Odesláním souhlasíte se zpracováním osobních údajů.
              </p>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default BookingSection;
