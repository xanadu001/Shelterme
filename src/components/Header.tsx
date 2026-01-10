import { Home, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 text-primary font-bold text-xl">
            <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-accent-foreground" />
            </div>
            <span>StudentNest</span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#listings" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Browse Listings
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              How It Works
            </a>
            <a href="#universities" className="text-muted-foreground hover:text-foreground transition-colors font-medium">
              Universities
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost">Sign In</Button>
            <Button variant="accent">List Your Property</Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-in">
            <nav className="flex flex-col gap-4">
              <a href="#listings" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                Browse Listings
              </a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                How It Works
              </a>
              <a href="#universities" className="text-muted-foreground hover:text-foreground transition-colors font-medium py-2">
                Universities
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="ghost" className="justify-start">Sign In</Button>
                <Button variant="accent">List Your Property</Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
