import { useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useBranches } from "@/hooks/useBranches";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Branches page component
const Branches = () => {
  const { data: branches, isLoading } = useBranches();
  const [search, setSearch] = useState("");

  const filteredBranches = branches?.filter(
    (branch) =>
      branch.name.toLowerCase().includes(search.toLowerCase()) ||
      branch.city.toLowerCase().includes(search.toLowerCase()) ||
      branch.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-accent font-semibold uppercase tracking-wider text-sm">Pobočky</span>
            <h1 className="text-4xl sm:text-5xl font-display text-foreground mt-2 mb-4">
              Naše STK stanice
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Vyberte si pobočku nejblíže k vám. Každá stanice má vlastní ceník, skupiny vozidel a rezervační systém.
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Hledat podle města nebo názvu..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12"
              />
            </div>
          </div>

          {/* Branches Grid */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-2xl p-6 animate-pulse border border-border">
                  <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3 mb-4"></div>
                  <div className="h-10 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredBranches?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Žádné pobočky nenalezeny.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBranches?.map((branch) => (
                <div
                  key={branch.id}
                  className="bg-card rounded-2xl p-6 card-elevated border border-border hover:border-accent/30 transition-all duration-300"
                >
                  <h2 className="text-xl font-display text-foreground mb-3">
                    {branch.name}
                  </h2>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2 text-muted-foreground text-sm">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{branch.address}, {branch.postal_code} {branch.city}</span>
                    </div>
                    
                    {branch.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <a href={`tel:${branch.phone}`} className="hover:text-accent transition-colors">
                          {branch.phone}
                        </a>
                      </div>
                    )}
                    
                    {branch.email && (
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <a href={`mailto:${branch.email}`} className="hover:text-accent transition-colors">
                          {branch.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {branch.description && (
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                      {branch.description}
                    </p>
                  )}

                  <Link
                    to={`/pobocky/${branch.slug}`}
                    className="inline-flex items-center gap-2 text-accent font-semibold hover:gap-3 transition-all"
                  >
                    Detail a rezervace
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Branches;
