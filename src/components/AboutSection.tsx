import { Check } from "lucide-react";

const benefits = [
  "Bez objednání do 30 minut",
  "Moderní diagnostické vybavení",
  "Certifikovaní technici",
  "Transparentní ceny bez skrytých poplatků",
  "Pohodlná čekárna s Wi-Fi a kávou",
  "Parkování zdarma",
];

const AboutSection = () => {
  return (
    <section id="o-nas" className="py-20 lg:py-28 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Content */}
          <div>
            <span className="text-accent font-semibold uppercase tracking-wider text-sm">O nás</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-foreground mt-2 mb-6">
              Více než 15 let zkušeností
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              Jsme rodinná firma s dlouholetou tradicí v oblasti technických kontrol vozidel. 
              Od roku 2008 jsme provedli více než 750 000 kontrol a získali si důvěru tisíců spokojených zákazníků.
            </p>
            <p className="text-muted-foreground text-lg mb-8">
              Investujeme do nejmodernějšího vybavení a pravidelně školíme náš tým, 
              abychom vám mohli nabídnout ty nejlepší služby.
            </p>

            {/* Benefits List */}
            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-foreground font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-2xl p-6 lg:p-8 card-elevated border border-border">
              <p className="text-4xl lg:text-5xl font-display text-accent mb-2">750k+</p>
              <p className="text-muted-foreground">Provedených kontrol</p>
            </div>
            <div className="bg-card rounded-2xl p-6 lg:p-8 card-elevated border border-border">
              <p className="text-4xl lg:text-5xl font-display text-accent mb-2">15+</p>
              <p className="text-muted-foreground">Let na trhu</p>
            </div>
            <div className="bg-card rounded-2xl p-6 lg:p-8 card-elevated border border-border">
              <p className="text-4xl lg:text-5xl font-display text-accent mb-2">12</p>
              <p className="text-muted-foreground">Zkušených techniků</p>
            </div>
            <div className="bg-card rounded-2xl p-6 lg:p-8 card-elevated border border-border">
              <p className="text-4xl lg:text-5xl font-display text-accent mb-2">4.9</p>
              <p className="text-muted-foreground">Hodnocení Google</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
