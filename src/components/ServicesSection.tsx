import { Car, Gauge, FileCheck, Wrench, AlertTriangle, CheckCircle, Clock, LucideIcon } from "lucide-react";
import { useAllSiteContent, getContent } from "@/hooks/useSiteContent";
import { useServices } from "@/hooks/useServices";
import { useSiteSettings, isSettingEnabled } from "@/hooks/useSiteSettings";

// Map icon names to components
const iconMap: Record<string, LucideIcon> = {
  Car,
  Gauge,
  FileCheck,
  Wrench,
  AlertTriangle,
  CheckCircle,
};

const ServicesSection = () => {
  const { data: content } = useAllSiteContent();
  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: settings } = useSiteSettings();

  // Check if prices should be visible
  const showPrices = isSettingEnabled(settings, "prices_visible", false);

  // Get section header from CMS
  const sectionLabel = getContent(content, "services", "section_label", "content", "Naše služby");
  const sectionTitle = getContent(content, "services", "section_title", "title", "Kompletní technické kontroly");
  const sectionDescription = getContent(content, "services", "section_description", "content", 
    "Nabízíme širokou škálu služeb pro všechny typy vozidel. Vše na jednom místě s profesionálním přístupem.");

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return null;
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours} hod`;
    return `${hours} hod ${remainingMinutes} min`;
  };

  const formatPrice = (price: number | null) => {
    if (!price) return null;
    return `${price.toLocaleString('cs-CZ')} Kč`;
  };

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
        {servicesLoading ? (
          <div className="text-center py-12 text-muted-foreground">Načítání služeb...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services?.map((service, index) => {
              const IconComponent = iconMap[service.icon || "Car"] || Car;
              return (
                <div
                  key={service.id}
                  className="group bg-card rounded-2xl p-6 lg:p-8 card-elevated border border-border hover:border-accent/30 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
                    <IconComponent className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-display text-foreground mb-3">{service.name}</h3>
                  <p className="text-muted-foreground mb-4">{service.description}</p>
                  
                  {/* Duration and Price */}
                  <div className="flex flex-wrap items-center gap-3 mt-auto pt-4 border-t border-border/50">
                    {service.duration_minutes && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{formatDuration(service.duration_minutes)}</span>
                      </div>
                    )}
                    {showPrices && service.price && (
                      <div className="ml-auto text-lg font-semibold text-accent">
                        {formatPrice(service.price)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesSection;
