import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAllSiteContent, getContent } from "@/hooks/useSiteContent";
import { useSiteSettings, isSettingEnabled } from "@/hooks/useSiteSettings";

const defaultPricingItems = [
  {
    title: "STK osobní vozidlo",
    price: "800",
    description: "Kompletní technická kontrola osobního automobilu",
    features: ["Kontrola brzdového systému", "Kontrola podvozku", "Kontrola osvětlení", "Kontrola emisí", "Protokol o kontrole"],
    popular: true,
  },
  {
    title: "Měření emisí",
    price: "400",
    description: "Samostatné měření emisí bez STK",
    features: ["Měření CO, HC", "Měření kouřivosti", "Protokol o měření", "Platnost 1 rok"],
    popular: false,
  },
  {
    title: "Evidenční kontrola",
    price: "300",
    description: "Kontrola identifikačních údajů vozidla",
    features: ["Kontrola VIN", "Kontrola registračních údajů", "Protokol pro registr", "Rychlé vyřízení"],
    popular: false,
  },
];

const PricingSection = () => {
  const { data: content } = useAllSiteContent();
  const { data: settings } = useSiteSettings();

  // Check if pricing is visible
  const pricesVisible = isSettingEnabled(settings, "prices_visible", true);

  // If prices are hidden, don't render the section at all
  if (!pricesVisible) {
    return null;
  }

  // Get section header from CMS
  const sectionLabel = getContent(content, "pricing", "section_label", "content", "Ceník");
  const sectionTitle = getContent(content, "pricing", "section_title", "title", "Transparentní ceny");
  const sectionDescription = getContent(content, "pricing", "section_description", "content", 
    "Žádné skryté poplatky. Ceny jsou konečné a platíte pouze za skutečně provedené služby.");
  const sectionNote = getContent(content, "pricing", "section_note", "content",
    "* Ceny jsou orientační. Konečná cena závisí na typu a kategorii vozidla.");

  return (
    <section id="cenik" className="py-20 lg:py-28 bg-background">
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

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {defaultPricingItems.map((item) => (
            <div
              key={item.title}
              className={`relative bg-card rounded-2xl p-6 lg:p-8 card-elevated border transition-all duration-300 ${
                item.popular ? "border-accent ring-2 ring-accent/20" : "border-border"
              }`}
            >
              {item.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-accent text-accent-foreground text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full">
                    Nejčastější
                  </span>
                </div>
              )}

              <h3 className="text-xl font-display text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{item.description}</p>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl lg:text-5xl font-display text-foreground">{item.price}</span>
                <span className="text-muted-foreground">Kč</span>
              </div>

              <ul className="space-y-3 mb-6">
                {item.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-muted-foreground text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={item.popular ? "accent" : "outline"}
                className="w-full"
              >
                Objednat
              </Button>
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="text-center text-muted-foreground text-sm mt-8">
          {sectionNote}
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
