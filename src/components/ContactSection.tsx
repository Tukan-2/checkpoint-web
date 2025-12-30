import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAllSiteContent, getContent } from "@/hooks/useSiteContent";
import { useSiteSettings, getSetting } from "@/hooks/useSiteSettings";

const ContactSection = () => {
  const { data: content } = useAllSiteContent();
  const { data: settings } = useSiteSettings();

  const title = getContent(content, "contact", "title", "content", "Kde nás najdete");
  const phone = getSetting(settings, "contact_phone", "+420 123 456 789");
  const email = getSetting(settings, "contact_email", "info@stk-autokontrol.cz");

  return (
    <section id="kontakt" className="py-20 lg:py-28 bg-secondary/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-accent font-semibold uppercase tracking-wider text-sm">Kontakt</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-foreground mt-2 mb-4">
            {title}
          </h2>
          <p className="text-muted-foreground text-lg">
            Jsme snadno dostupní s dostatkem parkovacích míst. Přijeďte kdykoli v otevírací době.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 card-elevated border border-border">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground mb-1">Adresa</h3>
                  <p className="text-muted-foreground">Průmyslová 1234/56</p>
                  <p className="text-muted-foreground">110 00 Praha 1</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 card-elevated border border-border">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground mb-1">Telefon</h3>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-accent hover:text-accent/80 font-semibold text-lg">
                    {phone}
                  </a>
                  <p className="text-muted-foreground text-sm mt-1">Volejte v otevírací době</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 card-elevated border border-border">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground mb-1">E-mail</h3>
                  <a href={`mailto:${email}`} className="text-accent hover:text-accent/80 font-semibold">
                    {email}
                  </a>
                  <p className="text-muted-foreground text-sm mt-1">Odpovíme do 24 hodin</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 card-elevated border border-border">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground mb-2">Otevírací doba</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pondělí - Pátek</span>
                      <span className="text-foreground font-medium">7:00 - 17:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sobota</span>
                      <span className="text-foreground font-medium">8:00 - 12:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Neděle</span>
                      <span className="text-foreground font-medium">Zavřeno</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button variant="accent" size="lg" className="w-full">
              Objednat termín online
            </Button>
          </div>

          {/* Map */}
          <div className="bg-card rounded-2xl overflow-hidden card-elevated border border-border h-[400px] lg:h-auto min-h-[500px]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2560.123456789!2d14.4!3d50.08!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTDCsDA0JzQ4LjAiTiAxNMKwMjQnMDAuMCJF!5e0!3m2!1scs!2scz!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Mapa STK AutoKontrol"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
