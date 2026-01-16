import { useNavigate } from "react-router-dom";
import { GraduationCap, Building2, ArrowRight, Home, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">StudentStay</span>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate("/auth")}
            className="text-foreground hover:bg-primary/10"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 px-6 py-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          {/* Hero text */}
          <div className="text-center mb-16 md:mb-20">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Find Your Perfect
              <span className="text-primary block">Student Home</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect students with verified landlords and agents. Safe, affordable, 
              and convenient housing near your university.
            </p>
          </div>

          {/* Glassmorphism Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Student Card */}
            <div 
              onClick={() => navigate("/auth?role=student")}
              className="group cursor-pointer"
            >
              <div className="relative backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/40 dark:border-white/20 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                {/* Glass reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-60 pointer-events-none" />
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/30 rounded-full blur-2xl group-hover:bg-primary/40 transition-colors duration-500" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-primary/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <GraduationCap className="w-8 h-8 text-primary" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-foreground mb-3">
                    I'm a Student
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Browse verified properties near your university. Find safe, affordable 
                    accommodation with transparent pricing and trusted landlords.
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm text-foreground/80">
                      <Shield className="w-4 h-4 text-primary" />
                      <span>Verified properties only</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground/80">
                      <Users className="w-4 h-4 text-primary" />
                      <span>Direct landlord contact</span>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-6 text-base font-semibold group-hover:shadow-lg transition-all duration-300">
                    Find a Home
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Landlord/Agent Card */}
            <div 
              onClick={() => navigate("/auth?role=landlord")}
              className="group cursor-pointer"
            >
              <div className="relative backdrop-blur-xl bg-white/30 dark:bg-white/10 border border-white/40 dark:border-white/20 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                {/* Glass reflection effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-60 pointer-events-none" />
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/30 rounded-full blur-2xl group-hover:bg-primary/40 transition-colors duration-500" />
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-primary/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-foreground mb-3">
                    I'm a Landlord / Agent
                  </h2>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    List your properties and reach thousands of students. 
                    Manage bookings, inquiries, and grow your rental business.
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-sm text-foreground/80">
                      <Shield className="w-4 h-4 text-primary" />
                      <span>Get verified status</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-foreground/80">
                      <Users className="w-4 h-4 text-primary" />
                      <span>Reach more students</span>
                    </div>
                  </div>
                  
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-6 text-base font-semibold group-hover:shadow-lg transition-all duration-300">
                    List Property
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Browse link */}
          <div className="text-center mt-12">
            <button 
              onClick={() => navigate("/")}
              className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-2 transition-colors"
            >
              Or browse properties without signing up
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-8 mt-auto">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          © 2024 StudentStay. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
