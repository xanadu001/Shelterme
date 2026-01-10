import { Search, CheckCircle, Calendar, Home } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search & Discover",
    description: "Browse thousands of verified student listings near your university. Filter by price, amenities, and location.",
  },
  {
    icon: CheckCircle,
    title: "Verified & Safe",
    description: "Every listing is verified by our team. View photos, read reviews, and contact landlords directly.",
  },
  {
    icon: Calendar,
    title: "Book Your Stay",
    description: "Schedule viewings or book directly online. Secure your accommodation with our protected payment system.",
  },
  {
    icon: Home,
    title: "Move In",
    description: "Get your keys and move into your new home. We're here to support you throughout your stay.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-16 bg-secondary/50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How StudentNest Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Finding your student home has never been easier. Follow these simple steps to get started.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative text-center animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-1/2 w-full h-0.5 bg-border" />
              )}

              {/* Icon */}
              <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-accent/10 text-accent mb-6">
                <step.icon className="w-8 h-8" />
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent text-accent-foreground text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
