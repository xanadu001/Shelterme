import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Home, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import heroBg from "@/assets/hero-bg.jpg";

const NIGERIAN_UNIVERSITIES = [
  "University of Lagos (UNILAG)",
  "University of Ibadan (UI)",
  "Obafemi Awolowo University (OAU)",
  "University of Nigeria, Nsukka (UNN)",
  "Ahmadu Bello University (ABU)",
  "University of Benin (UNIBEN)",
  "University of Ilorin (UNILORIN)",
  "Lagos State University (LASU)",
  "Covenant University",
  "Babcock University",
  "Other"
];

const signUpSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  phone: z.string().trim().min(10, "Please enter a valid phone number"),
  university: z.string().min(1, "Please select your university")
});

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

const AuthPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    university: ""
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          navigate("/explore");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/explore");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (isLogin) {
        const result = loginSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email.trim(),
          password: formData.password
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Login Failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Login Failed",
              description: error.message,
              variant: "destructive"
            });
          }
          setIsLoading(false);
          return;
        }
      } else {
        const result = signUpSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const redirectUrl = `${window.location.origin}/`;

        const { data, error } = await supabase.auth.signUp({
          email: formData.email.trim(),
          password: formData.password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account Exists",
              description: "An account with this email already exists. Please log in instead.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Sign Up Failed",
              description: error.message,
              variant: "destructive"
            });
          }
          setIsLoading(false);
          return;
        }

        if (data.user) {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              full_name: formData.fullName.trim(),
              email: formData.email.trim(),
              phone: formData.phone.trim(),
              university: formData.university
            });

          if (profileError) {
            toast({
              title: "Profile Error",
              description: "Account created but profile setup failed. Please contact support.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Welcome!",
              description: "Your account has been created successfully."
            });
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Hero Image (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src={heroBg}
          alt="Student accommodation"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-primary/50" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-white/90 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </button>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
                Find Your Perfect
                <br />
                Student Home
              </h1>
              <p className="text-lg text-white/90 max-w-md">
                Discover verified, affordable accommodations near your campus. 
                Join thousands of students who've found their ideal living space.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Verified Listings</p>
                  <p className="text-sm text-white/80">All properties are personally verified</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">500+ Properties</p>
                  <p className="text-sm text-white/80">Across all major universities</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">4.8 Rating</p>
                  <p className="text-sm text-white/80">Trusted by 10,000+ students</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-white/60">
            © 2024 StudentHomes. Making student housing simple.
          </p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-background">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-3 z-10">
          <button
            onClick={() => navigate("/")}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-semibold text-foreground">
            {isLogin ? "Log In" : "Create Account"}
          </h1>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Logo/Brand */}
            <div className="mb-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Home className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">StudentHomes</span>
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">
                {isLogin ? "Welcome back" : "Create your account"}
              </h2>
              <p className="text-muted-foreground">
                {isLogin
                  ? "Enter your credentials to access your account"
                  : "Join our community of students finding their perfect home"
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className={`h-12 px-4 ${errors.fullName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive">{errors.fullName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="08012345678"
                      className={`h-12 px-4 ${errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="university" className="text-sm font-medium">University</Label>
                    <select
                      id="university"
                      name="university"
                      value={formData.university}
                      onChange={handleInputChange}
                      className={`w-full h-12 px-4 rounded-lg border bg-background text-foreground text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                        errors.university ? "border-destructive" : "border-input"
                      }`}
                    >
                      <option value="">Select your university</option>
                      {NIGERIAN_UNIVERSITIES.map(uni => (
                        <option key={uni} value={uni}>{uni}</option>
                      ))}
                    </select>
                    {errors.university && (
                      <p className="text-sm text-destructive">{errors.university}</p>
                    )}
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@university.edu"
                  className={`h-12 px-4 ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                    className={`h-12 px-4 pr-12 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {isLogin && (
                <div className="flex justify-end">
                  <button type="button" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Please wait...
                  </span>
                ) : isLogin ? "Log In" : "Create Account"}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-4 text-sm text-muted-foreground">
                  {isLogin ? "New to StudentHomes?" : "Already have an account?"}
                </span>
              </div>
            </div>

            {/* Toggle Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="w-full h-12 text-base font-medium"
            >
              {isLogin ? "Create an Account" : "Log In Instead"}
            </Button>

            {/* Terms */}
            {!isLogin && (
              <p className="text-xs text-center text-muted-foreground mt-6">
                By creating an account, you agree to our{" "}
                <button className="text-primary hover:underline">Terms of Service</button>
                {" "}and{" "}
                <button className="text-primary hover:underline">Privacy Policy</button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
