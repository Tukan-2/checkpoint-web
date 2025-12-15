import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Clock, Award } from "lucide-react";
import heroImage from "@/assets/hero-inspection.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center hero-bg overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Stanice technické kontroly"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary/80" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pt-20 pb-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-full px-4 py-2 mb-6 animate-fade-up">
              <Shield className="w-4 h-4 text-accent" />
              <span className="text-accent font-medium text-sm">Certifikovaná stanice STK</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display text-primary-foreground mb-6 leading-tight animate-fade-up-delay-1">
              Technická kontrola
              <span className="block text-gradient">bez čekání</span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-primary-foreground/70 mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-up-delay-2">
              Profesionální stanice technické kontroly s moderním vybavením. 
              Rychlá kontrola, férové jednání a transparentní ceny.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-up-delay-3">
              <Button variant="hero" size="xl">
                Objednat termín
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="heroOutline" size="xl">
                Zjistit více
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-primary-foreground/10">
              <div className="text-center lg:text-left">
                <p className="text-3xl sm:text-4xl font-display text-accent">15+</p>
                <p className="text-primary-foreground/60 text-sm">Let zkušeností</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-3xl sm:text-4xl font-display text-accent">50k+</p>
                <p className="text-primary-foreground/60 text-sm">Kontrol ročně</p>
              </div>
              <div className="text-center lg:text-left">
                <p className="text-3xl sm:text-4xl font-display text-accent">98%</p>
                <p className="text-primary-foreground/60 text-sm">Spokojených</p>
              </div>
            </div>
          </div>

          {/* Right Side - Feature Cards */}
          <div className="hidden lg:grid gap-4">
            <div className="bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 rounded-2xl p-6 animate-fade-up-delay-1">
              <Clock className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-xl font-display text-primary-foreground mb-2">Rychlá kontrola</h3>
              <p className="text-primary-foreground/60">Průměrná doba kontroly 30-45 minut. Bez zbytečného čekání.</p>
            </div>
            <div className="bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 rounded-2xl p-6 animate-fade-up-delay-2">
              <Shield className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-xl font-display text-primary-foreground mb-2">Moderní vybavení</h3>
              <p className="text-primary-foreground/60">Nejnovější diagnostické přístroje pro přesnou kontrolu.</p>
            </div>
            <div className="bg-primary-foreground/5 backdrop-blur-sm border border-primary-foreground/10 rounded-2xl p-6 animate-fade-up-delay-3">
              <Award className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-xl font-display text-primary-foreground mb-2">Certifikovaný tým</h3>
              <p className="text-primary-foreground/60">Zkušení technici s platnými certifikacemi a pravidelnými školeními.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
