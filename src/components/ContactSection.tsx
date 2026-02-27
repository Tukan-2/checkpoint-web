import { MapPin, Mail, Info } from "lucide-react";
import { useAllSiteContent, getContent } from "@/hooks/useSiteContent";
import { useSiteSettings, getSetting } from "@/hooks/useSiteSettings";

const ContactSection = () => {
  const { data: content } = useAllSiteContent();
  const { data: settings } = useSiteSettings();

  const title = getContent(content, "contact", "title", "content", "Kde nás najdete");
  const subtitle = getContent(content, "contact", "subtitle", "content", "Centrální kontaktní údaje naší společnosti.");
  const email = getSetting(settings, "contact_email", "info@stk-autokontrol.cz");
  const address = getSetting(settings, "contact_address", "Průmyslová 1234/56, 110 00 Praha 1");
  const branchNote = getSetting(settings, "contact_branch_note", "Kontakty na jednotlivé pobočky najdete v detailu příslušné stanice.");

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
            {subtitle}
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Address */}
          <div className="bg-card rounded-2xl p-6 card-elevated border border-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-display text-lg text-foreground mb-1">Sídlo firmy</h3>
                <p className="text-muted-foreground">{address}</p>
              </div>
            </div>
          </div>

          {/* Email */}
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
              </div>
            </div>
          </div>

          {/* Branch note */}
          <div className="bg-card rounded-2xl p-6 card-elevated border border-border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-display text-lg text-foreground mb-1">Kontakty poboček</h3>
                <p className="text-muted-foreground">{branchNote}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
