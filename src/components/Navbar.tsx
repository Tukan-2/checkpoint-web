import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  const navLinks = [
    { name: "Služby", href: "#sluzby", isHash: true },
    { name: "Pobočky", href: "/pobocky", isHash: false },
    { name: "O nás", href: "#o-nas", isHash: true },
    { name: "Ceník", href: "#cenik", isHash: true },
    { name: "Rezervace", href: "#rezervace", isHash: true },
    { name: "Kontakt", href: "#kontakt", isHash: true },
  ];

  const renderNavLink = (link: typeof navLinks[0]) => {
    if (link.isHash) {
      if (isHomePage) {
        return (
          <a
            key={link.name}
            href={link.href}
            className="text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium"
          >
            {link.name}
          </a>
        );
      } else {
        return (
          <Link
            key={link.name}
            to={`/${link.href}`}
            className="text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium"
          >
            {link.name}
          </Link>
        );
      }
    } else {
      return (
        <Link
          key={link.name}
          to={link.href}
          className="text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium"
        >
          {link.name}
        </Link>
      );
    }
  };

  const renderMobileNavLink = (link: typeof navLinks[0]) => {
    if (link.isHash && isHomePage) {
      return (
        <a
          key={link.name}
          href={link.href}
          className="block py-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium"
          onClick={() => setIsOpen(false)}
        >
          {link.name}
        </a>
      );
    } else {
      return (
        <Link
          key={link.name}
          to={link.isHash ? `/${link.href}` : link.href}
          className="block py-3 text-primary-foreground/80 hover:text-primary-foreground transition-colors font-medium"
          onClick={() => setIsOpen(false)}
        >
          {link.name}
        </Link>
      );
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-sm border-b border-primary-foreground/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-accent-foreground font-display font-bold text-xl">STK</span>
            </div>
            <span className="text-primary-foreground font-display text-xl hidden sm:block">
              AutoKontrol
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(renderNavLink)}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <a href="tel:+420123456789" className="flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground">
              <Phone className="w-4 h-4" />
              <span className="font-semibold">+420 123 456 789</span>
            </a>
            <Button variant="accent" size="default" asChild>
              <Link to="/pobocky">Objednat se</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-primary-foreground p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-primary-foreground/10">
            {navLinks.map(renderMobileNavLink)}
            <div className="pt-4 mt-4 border-t border-primary-foreground/10">
              <a href="tel:+420123456789" className="flex items-center gap-2 text-primary-foreground/80 mb-4">
                <Phone className="w-4 h-4" />
                <span className="font-semibold">+420 123 456 789</span>
              </a>
              <Button variant="accent" className="w-full" asChild>
                <Link to="/pobocky" onClick={() => setIsOpen(false)}>Objednat se</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
