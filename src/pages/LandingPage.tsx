import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Building2, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

const NIGERIAN_UNIVERSITIES = [
  "Federal University of Technology, Minna (FUTMINNA)",
];

type UserRole = "student" | "landlord" | "admin";

const LandingPage = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [selectedUniversity, setSelectedUniversity] = useState("");

  const handleCreateAccount = () => {
    // Admins can only log in, not sign up
    if (selectedRole === "admin") {
      navigate("/auth?mode=admin-login");
      return;
    }
    
    const params = new URLSearchParams();
    params.set("role", selectedRole);
    if (selectedUniversity) {
      params.set("university", selectedUniversity);
    }
    navigate(`/auth?${params.toString()}`);
  };

  const handleLogin = () => {
    navigate("/auth");
  };

  const roles = [
    {
      id: "student" as UserRole,
      icon: GraduationCap,
      title: "I am a Student",
      description: "Looking for a place to stay"
    },
    {
      id: "landlord" as UserRole,
      icon: Building2,
      title: "I am a Landlord/Agent",
      description: "Listing properties for students"
    },
    {
      id: "admin" as UserRole,
      icon: Shield,
      title: "I am an Admin",
      description: "Managing platform operations"
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="ShelterMe" className="w-48 h-48 mb-4" />
            <h1 className="text-2xl font-bold text-foreground">shelterMe</h1>
            <p className="text-sm text-muted-foreground text-center mt-1">
              Find your perfect home near campus in Nigeria.
            </p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              Tell us who you are
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Choose a role to personalize your experience.
            </p>

            <div className="space-y-3">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border bg-background hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <Icon className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${isSelected ? "text-foreground" : "text-foreground"}`}>
                        {role.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {role.description}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* University Selection */}
          <div className="mb-8">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Select Your University
            </label>
            <select
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
              className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 12px center",
                backgroundSize: "20px"
              }}
            >
              <option value="">Search for your institution...</option>
              {NIGERIAN_UNIVERSITIES.map((uni) => (
                <option key={uni} value={uni}>{uni}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground mt-2">
              We'll use this to find hostels within walking distance of your campus.
            </p>
          </div>

          {/* Create Account Button */}
          <Button
            onClick={handleCreateAccount}
            className="w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            {selectedRole === "admin" ? "Admin Login" : "Create My Account"}
          </Button>

          {/* Login Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <button
              onClick={handleLogin}
              className="text-primary font-medium hover:underline"
            >
              Log In
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
