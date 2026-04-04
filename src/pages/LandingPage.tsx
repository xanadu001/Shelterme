import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect } from "react";
import logo from "@/assets/logo.png";
import heroImage from "@/assets/landing-hero.png";

const LandingPage = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile === false) {
      navigate("/explore", { replace: true });
    }
  }, [isMobile, navigate]);
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-2 px-5 pt-5 pb-2">
        <img src={logo} alt="LodgeMe" className="w-8 h-8" />
        <span className="text-lg font-bold text-foreground">LodgeMe</span>
      </header>

      {/* Location Tag */}
      <div className="px-5 mb-2">
        <span className="inline-flex items-center gap-1 text-sm text-lodge-accent font-medium bg-lodge-accent/10 px-3 py-1 rounded-full">
          <MapPin className="w-3.5 h-3.5" />
          Minna
        </span>
      </div>

      {/* Hero Illustration */}
      <div className="flex-1 flex items-center justify-center px-6 py-2">
        <img
          src={heroImage}
          alt="Student finding accommodation"
          className="w-full max-w-xs object-contain"
          width={900}
          height={800}
        />
      </div>

      {/* Bottom Content */}
      <div className="px-6 pb-8 space-y-5">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground leading-tight">
            Find your perfect<br />student home
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Verified listings near your campus.<br />
            Fast, safe, and easy.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate("/auth?role=student")}
            className="w-full h-12 text-base font-semibold rounded-xl bg-lodge-accent text-lodge-accent-foreground hover:bg-lodge-accent/90"
          >
            Find a Place
          </Button>
          <Button
            onClick={() => navigate("/auth")}
            variant="outline"
            className="w-full h-12 text-base font-semibold rounded-xl"
          >
            Log In
          </Button>
        </div>

        {/* Continue as guest */}
        <button
          onClick={() => navigate("/explore")}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Continue as guest
        </button>

        {/* Footer location badge */}
        <div className="flex items-center justify-center gap-1.5 text-sm text-lodge-accent font-medium">
          <MapPin className="w-4 h-4" />
          <span>Minna · 10,000+ listings</span>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
