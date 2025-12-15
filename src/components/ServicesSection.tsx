import { Car, Gauge, FileCheck, Wrench, AlertTriangle, CheckCircle } from "lucide-react";

const services = [
  {
    icon: Car,
    title: "STK osobních vozidel",
    description: "Kompletní technická kontrola osobních automobilů včetně emisí. Rychle a profesionálně.",
  },
  {
    icon: Gauge,
    title: "Měření emisí",
    description: "Přesné měření emisí benzínových i naftových motorů s okamžitým výsledkem.",
  },
  {
    icon: FileCheck,
    title: "Evidenční kontrola",
    description: "Kontrola identifikačních údajů vozidla pro přepis nebo změnu v registru.",
  },
  {
    icon: Wrench,
    title: "STK nákladních vozidel",
    description: "Technická kontrola nákladních vozidel, přívěsů a návěsů do 3,5 tuny.",
  },
  {
    icon: AlertTriangle,
    title: "ADR kontrola",
    description: "Speciální kontrola vozidel pro přepravu nebezpečných látek.",
  },
  {
    icon: CheckCircle,
    title: "Opakovaná kontrola",
    description: "Rychlá opakovaná kontrola po odstranění závad do 30 dnů.",
  },
];

const ServicesSection = () => {
  return (
    <section id="sluzby" className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-accent font-semibold uppercase tracking-wider text-sm">Naše služby</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-foreground mt-2 mb-4">
            Kompletní technické kontroly
          </h2>
          <p className="text-muted-foreground text-lg">
            Nabízíme širokou škálu služeb pro všechny typy vozidel. Vše na jednom místě s profesionálním přístupem.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group bg-card rounded-2xl p-6 lg:p-8 card-elevated border border-border hover:border-accent/30 transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                <service.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-display text-foreground mb-3">{service.title}</h3>
              <p className="text-muted-foreground">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
