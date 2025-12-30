import { Car, Gauge, FileCheck, Wrench, AlertTriangle, CheckCircle, LucideIcon } from "lucide-react";
import { useAllSiteContent, getContent } from "@/hooks/useSiteContent";

// Map icon names to components
const iconMap: Record<string, LucideIcon> = {
  Car,
  Gauge,
  FileCheck,
  Wrench,
  AlertTriangle,
  CheckCircle,
};

// Fallback services for when CMS is empty
const defaultServices = [
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
  const { data: content, isLoading } = useAllSiteContent();

  // Get section header from CMS
  const sectionLabel = getContent(content, "services", "section_label", "content", "Naše služby");
  const sectionTitle = getContent(content, "services", "section_title", "title", "Kompletní technické kontroly");
  const sectionDescription = getContent(content, "services", "section_description", "content", 
    "Nabízíme širokou škálu služeb pro všechny typy vozidel. Vše na jednom místě s profesionálním přístupem.");

  // Get services from CMS or use defaults
  const cmsServices = content?.services 
    ? Object.entries(content.services)
        .filter(([key]) => key.startsWith("service_") && key.endsWith("_title"))
        .map(([key]) => {
          const serviceKey = key.replace("_title", "");
          const iconName = content.services[`${serviceKey}_icon`]?.content || "Car";
          return {
            icon: iconMap[iconName] || Car,
            title: content.services[`${serviceKey}_title`]?.title || "",
            description: content.services[`${serviceKey}_description`]?.content || "",
            order: content.services[`${serviceKey}_title`]?.order_index || 0,
          };
        })
        .filter(s => s.title)
        .sort((a, b) => a.order - b.order)
    : [];

  const services = cmsServices.length > 0 ? cmsServices : defaultServices;

  return (
    <section id="sluzby" className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-accent font-semibold uppercase tracking-wider text-sm">{sectionLabel}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-foreground mt-2 mb-4">
            {sectionTitle}
          </h2>
          <p className="text-muted-foreground text-lg">
            {sectionDescription}
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
