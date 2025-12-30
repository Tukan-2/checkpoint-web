import { Phone, Mail, MapPin } from "lucide-react";
import { useAllSiteContent, getContent } from "@/hooks/useSiteContent";

const Footer = () => {
  const { data: content } = useAllSiteContent();

  const copyright = getContent(content, "footer", "copyright", "content", 
    `© ${new Date().getFullYear()} STK AutoKontrol. Všechna práva vyhrazena.`
  );

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-accent-foreground font-display font-bold text-xl">STK</span>
              </div>
              <span className="font-display text-xl">AutoKontrol</span>
            </div>
            <p className="text-primary-foreground/70 text-sm">
              Profesionální stanice technické kontroly s více než 15 lety zkušeností. 
              Vaše bezpečnost je naší prioritou.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg mb-4">Rychlé odkazy</h4>
            <ul className="space-y-2">
              <li>
                <a href="#sluzby" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Služby
                </a>
              </li>
              <li>
                <a href="#o-nas" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  O nás
                </a>
              </li>
              <li>
                <a href="#cenik" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Ceník
                </a>
              </li>
              <li>
                <a href="#kontakt" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors text-sm">
                  Kontakt
                </a>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display text-lg mb-4">Služby</h4>
            <ul className="space-y-2">
              <li className="text-primary-foreground/70 text-sm">STK osobních vozidel</li>
              <li className="text-primary-foreground/70 text-sm">Měření emisí</li>
              <li className="text-primary-foreground/70 text-sm">Evidenční kontrola</li>
              <li className="text-primary-foreground/70 text-sm">STK nákladních vozidel</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg mb-4">Kontakt</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-accent flex-shrink-0" />
                <span className="text-primary-foreground/70 text-sm">Průmyslová 1234/56, Praha</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                <a href="tel:+420123456789" className="text-primary-foreground/70 hover:text-primary-foreground text-sm">
                  +420 123 456 789
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                <a href="mailto:info@stk-autokontrol.cz" className="text-primary-foreground/70 hover:text-primary-foreground text-sm">
                  info@stk-autokontrol.cz
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/50 text-sm">
            {copyright}
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-primary-foreground/50 hover:text-primary-foreground text-sm transition-colors">
              Ochrana osobních údajů
            </a>
            <a href="#" className="text-primary-foreground/50 hover:text-primary-foreground text-sm transition-colors">
              Obchodní podmínky
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
