import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, GraduationCap, KeyRound, Layers, User, Mail, Lock, Phone, ArrowLeft, ArrowRight, CheckCircle2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import authHero1 from "@/assets/auth-hero-1.jpg";
import authHero2 from "@/assets/auth-hero-2.jpg";
import authHero3 from "@/assets/auth-hero-3.jpg";

const NIGERIAN_UNIVERSITIES = [
  "Federal University of Technology, Minna (FUTMINNA)",
];

const studentSignUpSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  phone: z.string().trim().min(10, "Please enter a valid phone number"),
  university: z.string().min(1, "Please select your university"),
});

const landlordSignUpSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  phone: z.string().trim().min(10, "Please enter a valid phone number"),
  companyName: z.string().optional(),
  university: z.string().min(1, "Please select your area of operation"),
});

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type UserRole = "student" | "landlord" | "agent";

const HERO_DATA = [
  {
    image: authHero1,
    title: "Empowering your academic journey.",
    subtitle: "Find a home that fuels your ambition. LodgeMe connects thousands of students with verified, secure housing across Nigeria.",
  },
  {
    image: authHero2,
    title: "Your home away from campus.",
    subtitle: "Join thousands of students finding safe, affordable, and vetted housing across Nigeria.",
  },
  {
    image: authHero3,
    title: "Experience the future of student living.",
    subtitle: "Your oasis is just a few steps away. Join thousands of students finding their perfect homes.",
  },
];

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isAdminLogin = searchParams.get("mode") === "admin-login";

  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(!searchParams.get("role") || isAdminLogin);
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    university: searchParams.get("university") || "",
    companyName: "",
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session?.user && isLogin) {
          setTimeout(() => {
            redirectBasedOnRole(session.user.id);
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        redirectBasedOnRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, isLogin]);

  const redirectBasedOnRole = async (userId: string) => {
    try {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (roleData?.role) {
        const role = roleData.role as string;
        switch (role) {
          case "student":
            navigate("/explore", { replace: true });
            break;
          case "landlord":
          case "agent":
            navigate("/dashboard", { replace: true });
            break;
          case "admin":
            navigate("/admin-dashboard", { replace: true });
            break;
          default:
            navigate("/explore", { replace: true });
        }
      } else {
        navigate("/explore", { replace: true });
      }
    } catch (error) {
      console.error("Error checking role:", error);
      navigate("/explore", { replace: true });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!formData.university) errs.university = "Please select your university";
    if (!formData.phone || formData.phone.length < 10) errs.phone = "Please enter a valid phone number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName || formData.fullName.trim().length < 2) errs.fullName = "Full name must be at least 2 characters";
    if (!formData.email || !z.string().email().safeParse(formData.email.trim()).success) errs.email = "Please enter a valid email address";
    if (!formData.password || formData.password.length < 6) errs.password = "Password must be at least 6 characters";
    if (!agreedToTerms) errs.terms = "You must agree to the Terms and Privacy Policy";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!selectedRole) {
        toast({ title: "Select a role", description: "Please choose how you'd like to use LodgeMe.", variant: "destructive" });
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (validateStep2()) setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setIsLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: { emailRedirectTo: redirectUrl },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast({ title: "Account Exists", description: "An account with this email already exists. Please log in instead.", variant: "destructive" });
        } else {
          toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" });
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          university: formData.university,
        });

        await supabase.from("user_roles").insert({
          user_id: data.user.id,
          role: selectedRole as "student" | "landlord" | "agent",
          phone: formData.phone.trim(),
          company_name: formData.companyName || null,
        });

        toast({ title: "Welcome!", description: `Your ${selectedRole} account has been created successfully.` });

        if (selectedRole === "landlord" || selectedRole === "agent") {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/explore", { replace: true });
        }
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "An unexpected error occurred", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message.includes("Invalid login credentials")
            ? "Invalid email or password. Please try again."
            : error.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const progressPercent = step === 1 ? 33 : step === 2 ? 66 : 100;
  const heroData = HERO_DATA[step - 1];

  // ── LOGIN VIEW ──
  if (isLogin) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left image */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <img src={authHero1} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
          <div className="relative z-10 p-10 flex flex-col justify-between h-full">
            <h2 className="text-white text-2xl font-bold">LodgeMe</h2>
            <div className="pb-10">
              <h3 className="text-white text-4xl font-bold leading-tight mb-4">Welcome back.</h3>
              <p className="text-white/80 text-lg max-w-md">Sign in to continue your housing journey.</p>
            </div>
          </div>
        </div>

        {/* Right form */}
        <div className="flex-1 flex flex-col min-h-screen">
          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
              <div className="lg:hidden mb-8">
                <h2 className="text-2xl font-bold text-foreground">LodgeMe</h2>
              </div>

              {isAdminLogin && (
                <div className="flex items-center gap-2 mb-6 text-muted-foreground">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-medium">Admin Portal</span>
                </div>
              )}

              <h1 className="text-3xl font-bold text-foreground mb-2">Sign In</h1>
              <p className="text-muted-foreground mb-8">Enter your credentials to access your account</p>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold text-sm">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email" name="email" type="email" value={formData.email} onChange={handleInputChange}
                      placeholder="you@example.com"
                      className={`h-12 rounded-xl pl-11 ${errors.email ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-semibold text-sm">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password" name="password" type={showPassword ? "text" : "password"}
                      value={formData.password} onChange={handleInputChange}
                      placeholder="Enter your password"
                      className={`h-12 rounded-xl pl-11 pr-12 ${errors.password ? "border-destructive" : ""}`}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                <Button type="submit" className="w-full h-12 text-base font-semibold rounded-xl" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              {!isAdminLogin && (
                <p className="text-center text-sm text-muted-foreground mt-8">
                  Don't have an account?{" "}
                  <button onClick={() => { setIsLogin(false); setStep(1); setErrors({}); }} className="text-foreground font-semibold hover:underline">
                    Sign Up
                  </button>
                </p>
              )}

              {isAdminLogin && (
                <p className="text-center text-sm text-muted-foreground mt-8">
                  Admin accounts are provisioned manually.{" "}
                  <button onClick={() => navigate("/")} className="text-foreground font-semibold hover:underline">Back to Home</button>
                </p>
              )}
            </div>
          </div>

          <footer className="px-6 py-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>© 2024 LodgeMe Oasis. All rights reserved.</span>
            <div className="flex gap-4">
              <button className="hover:text-foreground">Privacy Policy</button>
              <button className="hover:text-foreground">Help Center</button>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // ── SIGNUP WIZARD ──
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left image panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src={heroData.image} alt="" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />
        <div className="relative z-10 p-10 flex flex-col justify-between h-full">
          <h2 className="text-white text-2xl font-bold">LodgeMe</h2>
          <div className="pb-10">
            <h3 className="text-white text-4xl font-bold leading-tight mb-4">{heroData.title}</h3>
            <p className="text-white/80 text-lg max-w-md">{heroData.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Progress header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <span>Step {step} of 3</span>
            <span>{progressPercent}% Complete</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-6">
              <h2 className="text-xl font-bold text-foreground">LodgeMe</h2>
            </div>

            {/* ── STEP 1: Choose Role ── */}
            {step === 1 && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-1">Join the Sanctuary</h1>
                  <p className="text-muted-foreground">Step 1: Choose your path</p>
                </div>

                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("student")}
                    className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left ${
                      selectedRole === "student" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                      selectedRole === "student" ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <GraduationCap className={`w-6 h-6 ${selectedRole === "student" ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Student</h3>
                      <p className="text-sm text-muted-foreground">I'm looking for a place to stay near my campus.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole("landlord")}
                    className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left ${
                      selectedRole === "landlord" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                      selectedRole === "landlord" ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <KeyRound className={`w-6 h-6 ${selectedRole === "landlord" ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Landlord</h3>
                      <p className="text-sm text-muted-foreground">I want to list my property and find verified tenants.</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole("agent")}
                    className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left ${
                      selectedRole === "agent" ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                      selectedRole === "agent" ? "bg-primary/10" : "bg-muted"
                    }`}>
                      <Layers className={`w-6 h-6 ${selectedRole === "agent" ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Agent</h3>
                      <p className="text-sm text-muted-foreground">I manage multiple listings for various property owners.</p>
                    </div>
                  </button>
                </div>

                <Button onClick={handleNext} className="w-full h-12 text-base font-semibold rounded-xl" disabled={!selectedRole}>
                  Continue
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button onClick={() => { setIsLogin(true); setErrors({}); }} className="text-foreground font-semibold hover:underline">
                    Sign In
                  </button>
                </p>
              </div>
            )}

            {/* ── STEP 2: University & Contact ── */}
            {step === 2 && (
              <div className="space-y-8">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Step 2 of 3</p>
                  <h1 className="text-3xl font-bold text-foreground mb-1">Tell us more</h1>
                  <p className="text-muted-foreground">Step 2: University and Contact</p>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="font-semibold text-sm flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" /> Select University
                    </Label>
                    <select
                      name="university" value={formData.university} onChange={handleInputChange}
                      className={`w-full h-12 px-4 rounded-xl border bg-background text-foreground text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer ${
                        errors.university ? "border-destructive" : "border-input"
                      }`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 12px center",
                        backgroundSize: "20px",
                      }}
                    >
                      <option value="">Search for your university</option>
                      {NIGERIAN_UNIVERSITIES.map((uni) => (
                        <option key={uni} value={uni}>{uni}</option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground">Can't find your school? Contact support.</p>
                    {errors.university && <p className="text-xs text-destructive">{errors.university}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold text-sm flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Phone Number
                    </Label>
                    <div className="flex gap-2">
                      <div className="h-12 px-4 rounded-xl border border-input bg-muted flex items-center text-sm text-muted-foreground shrink-0">
                        +234
                      </div>
                      <Input
                        name="phone" type="tel" value={formData.phone} onChange={handleInputChange}
                        placeholder="812 345 6789"
                        className={`h-12 rounded-xl flex-1 ${errors.phone ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                  </div>

                  {(selectedRole === "landlord" || selectedRole === "agent") && (
                    <div className="space-y-2">
                      <Label className="font-semibold text-sm">Lodge Name <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                      <Input
                        name="companyName" value={formData.companyName} onChange={handleInputChange}
                        placeholder="e.g. Sunshine Lodge"
                        className="h-12 rounded-xl"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleBack} className="flex-1 h-12 rounded-xl font-semibold gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button onClick={handleNext} className="flex-1 h-12 rounded-xl font-semibold gap-2">
                    Continue <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button onClick={() => { setIsLogin(true); setErrors({}); }} className="text-foreground font-semibold hover:underline">
                    Sign In
                  </button>
                </p>
              </div>
            )}

            {/* ── STEP 3: Account Details ── */}
            {step === 3 && (
              <div className="space-y-8">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Step 3 of 3</p>
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-foreground">Final Details</h1>
                    <span className="text-sm text-muted-foreground">Almost there</span>
                  </div>
                </div>

                <p className="text-muted-foreground -mt-4">Step 3: Create your account</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="font-semibold text-sm">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        name="fullName" value={formData.fullName} onChange={handleInputChange}
                        placeholder="Enter your full name"
                        className={`h-12 rounded-xl pl-11 ${errors.fullName ? "border-destructive" : ""}`}
                      />
                    </div>
                    {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold text-sm">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        name="email" type="email" value={formData.email} onChange={handleInputChange}
                        placeholder="you@student.edu.ng"
                        className={`h-12 rounded-xl pl-11 ${errors.email ? "border-destructive" : ""}`}
                      />
                    </div>
                    {selectedRole === "student" && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="inline-block w-3 h-3 rounded-full bg-muted-foreground/30 text-center text-[8px] leading-3">i</span>
                        Must use your institutional .edu.ng address for verification
                      </p>
                    )}
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="font-semibold text-sm">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        name="password" type={showPassword ? "text" : "password"}
                        value={formData.password} onChange={handleInputChange}
                        placeholder="Create a password"
                        className={`h-12 rounded-xl pl-11 pr-12 ${errors.password ? "border-destructive" : ""}`}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => { setAgreedToTerms(checked === true); setErrors((prev) => ({ ...prev, terms: "" })); }}
                      className="mt-0.5"
                    />
                    <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                      I agree to the <button type="button" className="text-foreground font-medium hover:underline">Terms</button> and{" "}
                      <button type="button" className="text-foreground font-medium hover:underline">Privacy Policy</button>.
                    </label>
                  </div>
                  {errors.terms && <p className="text-xs text-destructive -mt-2">{errors.terms}</p>}

                  <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={handleBack} className="flex-1 h-12 rounded-xl font-semibold gap-2">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </Button>
                    <Button type="submit" className="flex-1 h-12 rounded-xl font-semibold gap-2" disabled={isLoading}>
                      {isLoading ? "Creating..." : "Complete Sign Up"} {!isLoading && <CheckCircle2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </form>

                <p className="text-center text-sm text-muted-foreground">
                  Need help with registration?{" "}
                  <button className="text-foreground font-semibold hover:underline">Contact Support</button>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span>© 2024 LodgeMe Oasis. All rights reserved.</span>
          <div className="flex gap-4">
            <button className="hover:text-foreground">Privacy Policy</button>
            <button className="hover:text-foreground">Help Center</button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AuthPage;
