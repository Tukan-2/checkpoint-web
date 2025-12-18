import { Link } from "react-router-dom";
import { MapPin, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBranches } from "@/hooks/useBranches";

const BranchesSection = () => {
  const { data: branches, isLoading } = useBranches();

  return (
    <section id="pobocky" className="py-20 lg:py-28 bg-secondary/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-accent font-semibold uppercase tracking-wider text-sm">Naše pobočky</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display text-foreground mt-2 mb-4">
            Síť STK po celé ČR
          </h2>
          <p className="text-muted-foreground text-lg">
            Více než 30 poboček s profesionálním přístupem. Každá pobočka má vlastní ceník a rezervační systém.
          </p>
        </div>

        {/* Branches Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches?.slice(0, 6).map((branch) => (
              <Link
                key={branch.id}
                to={`/pobocky/${branch.slug}`}
                className="group bg-card rounded-2xl p-6 card-elevated border border-border hover:border-accent/30 transition-all duration-300"
              >
                <h3 className="text-xl font-display text-foreground mb-2 group-hover:text-accent transition-colors">
                  {branch.name}
                </h3>
                
                <div className="flex items-start gap-2 text-muted-foreground text-sm mb-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{branch.address}, {branch.city}</span>
                </div>
                
                {branch.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{branch.phone}</span>
                  </div>
                )}

                <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                  {branch.description}
                </p>

                <div className="flex items-center gap-2 text-accent font-medium text-sm group-hover:gap-3 transition-all">
                  <span>Zobrazit detail</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="accent" size="lg" asChild>
            <Link to="/pobocky">
              Zobrazit všechny pobočky
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BranchesSection;
