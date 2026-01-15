import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Shield, Star, Home, MapPin, Users, Building2 } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Verified Listings",
      description: "Every property is thoroughly verified for your peace of mind",
    },
    {
      icon: MapPin,
      title: "Prime Locations",
      description: "Find accommodations near top universities across the city",
    },
    {
      icon: Users,
      title: "Student Community",
      description: "Join thousands of students who found their perfect home",
    },
  ];

  const stats = [
    { value: "500+", label: "Verified Listings" },
    { value: "10k+", label: "Happy Students" },
    { value: "50+", label: "Universities" },
    { value: "98%", label: "Satisfaction Rate" },
  ];

  const testimonials = [
    {
      name: "Amara Johnson",
      university: "Lagos State University",
      text: "Found my perfect apartment in just 2 days! The verification process gave me so much confidence.",
      rating: 5,
    },
    {
      name: "Chidi Okonkwo",
      university: "University of Lagos",
      text: "Best platform for student housing. The filters made it so easy to find what I needed.",
      rating: 5,
    },
    {
      name: "Fatima Bello",
      university: "Yaba College of Technology",
      text: "Affordable, safe, and close to campus. Exactly what every student needs!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt="Student housing"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary-foreground backdrop-blur-sm border border-primary/30 mb-6">
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">Trusted by 10,000+ Students</span>
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 animate-slide-up">
            Find Your Perfect
            <span className="block text-primary">Student Home</span>
          </h1>

          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto animate-slide-up">
            Discover verified, affordable student accommodations near your university. 
            Safe, convenient, and designed for student life.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Button
              size="xl"
              onClick={() => navigate("/explore")}
              className="group"
            >
              <Search className="w-5 h-5 mr-2" />
              Explore Listings
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="xl"
              variant="outline"
              onClick={() => navigate("/auth")}
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
            >
              Sign Up Free
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 rounded-full border-2 border-white/50 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/70 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-primary-foreground/80">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Students Choose Us
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We make finding student accommodation simple, safe, and stress-free
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Find your new home in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Browse Listings",
                description: "Explore hundreds of verified student accommodations with detailed photos and information",
              },
              {
                step: "02",
                title: "Connect & Visit",
                description: "Contact landlords directly and schedule visits to your favorite properties",
              },
              {
                step: "03",
                title: "Book & Move In",
                description: "Secure your accommodation with our safe booking process and move in hassle-free",
              },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-7xl font-bold text-primary/10 absolute -top-4 left-0">
                  {item.step}
                </div>
                <div className="relative pt-12">
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              What Students Say
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hear from students who found their perfect home with us
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-8 rounded-2xl bg-card border border-border"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.university}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-primary">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Find Your New Home?
          </h2>
          <p className="text-primary-foreground/80 mb-10 text-lg max-w-2xl mx-auto">
            Join thousands of students who have found their perfect accommodation. 
            Start your search today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="xl"
              onClick={() => navigate("/explore")}
              className="bg-white text-primary hover:bg-white/90"
            >
              <Search className="w-5 h-5 mr-2" />
              Start Exploring
            </Button>
            <Button
              size="xl"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              className="border-white/50 text-primary-foreground hover:bg-white/10"
            >
              <Building2 className="w-5 h-5 mr-2" />
              List Your Property
            </Button>
          </div>
        </div>
      </section>

      {/* For Landlords Section */}
      <section className="py-20 px-6 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Building2 className="w-4 h-4" />
            <span className="text-sm font-medium">For Property Owners</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Are You a Landlord or Agent?
          </h2>
          <p className="text-muted-foreground mb-10 text-lg max-w-2xl mx-auto">
            List your properties for free and reach thousands of students looking for accommodation. 
            Manage bookings, track views, and grow your rental business.
          </p>
          <Button
            size="xl"
            onClick={() => navigate("/dashboard")}
            className="gap-2"
          >
            <Building2 className="w-5 h-5" />
            Start Listing Properties
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-foreground">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Home className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold text-background">StudentStay</span>
            </div>
            <div className="flex items-center gap-6 text-background/70">
              <a href="#" className="hover:text-primary transition-colors">About</a>
              <a href="#" className="hover:text-primary transition-colors">Contact</a>
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <button onClick={() => navigate("/dashboard")} className="hover:text-primary transition-colors">
                List Property
              </button>
            </div>
            <div className="text-sm text-background/50">
              © 2025 StudentStay. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
