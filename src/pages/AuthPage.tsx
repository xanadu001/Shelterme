import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

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

// Schema for student signup
const studentSignUpSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  phone: z.string().trim().min(10, "Please enter a valid phone number"),
  university: z.string().min(1, "Please select your university")
});

// Schema for landlord/agent signup
const landlordSignUpSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  phone: z.string().trim().min(10, "Please enter a valid phone number"),
  companyName: z.string().optional(),
  university: z.string().min(1, "Please select your area of operation")
});

// Schema for admin signup
const adminSignUpSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  phone: z.string().trim().min(10, "Please enter a valid phone number"),
  adminCode: z.string().min(1, "Admin code is required")
});

const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
});

type UserRole = "student" | "landlord" | "admin";

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = (searchParams.get("role") as UserRole) || "student";
  const universityParam = searchParams.get("university");
  
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(!searchParams.get("role"));
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedRole] = useState<UserRole>(roleParam);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    university: universityParam || "",
    companyName: "",
    adminCode: ""
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          // Redirect based on role
          redirectBasedOnRole(session.user.id);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        redirectBasedOnRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const redirectBasedOnRole = async (userId: string) => {
    try {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (roleData?.role) {
        switch (roleData.role) {
          case "student":
            navigate("/student-dashboard");
            break;
          case "landlord":
          case "agent":
            navigate("/dashboard");
            break;
          case "admin":
            navigate("/admin-dashboard");
            break;
          default:
            navigate("/explore");
        }
      } else {
        navigate("/explore");
      }
    } catch (error) {
      console.error("Error checking role:", error);
      navigate("/explore");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    let schema;
    
    if (isLogin) {
      schema = loginSchema;
    } else {
      switch (selectedRole) {
        case "student":
          schema = studentSignUpSchema;
          break;
        case "landlord":
          schema = landlordSignUpSchema;
          break;
        case "admin":
          schema = adminSignUpSchema;
          break;
        default:
          schema = studentSignUpSchema;
      }
    }

    const result = schema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
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

        // Redirect will happen via onAuthStateChange
      } else {
        // Validate admin code if admin
        if (selectedRole === "admin" && formData.adminCode !== "ADMIN2024") {
          toast({
            title: "Invalid Admin Code",
            description: "Please enter a valid admin authorization code.",
            variant: "destructive"
          });
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
          // Create profile
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
            console.error("Profile creation error:", profileError);
          }

          // Create user role - map "landlord" from landing page to actual role
          const roleToInsert = selectedRole === "landlord" ? "landlord" : selectedRole;
          
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert({
              user_id: data.user.id,
              role: roleToInsert as "student" | "landlord" | "agent",
              phone: formData.phone.trim(),
              company_name: formData.companyName || null
            });

          if (roleError) {
            console.error("Role creation error:", roleError);
          }

          toast({
            title: "Welcome!",
            description: `Your ${selectedRole} account has been created successfully.`
          });
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

  const getRoleTitle = () => {
    switch (selectedRole) {
      case "student":
        return "Student Account";
      case "landlord":
        return "Landlord/Agent Account";
      case "admin":
        return "Admin Account";
      default:
        return "Account";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-4 py-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Home className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">ShelterMe</h1>
            <p className="text-sm text-muted-foreground text-center mt-1">
              {isLogin ? "Welcome back!" : `Create your ${getRoleTitle()}`}
            </p>
            {!isLogin && selectedRole !== "student" && (
              <span className={`mt-2 text-xs px-3 py-1 rounded-full ${
                selectedRole === "admin" 
                  ? "bg-purple-100 text-purple-700" 
                  : "bg-blue-100 text-blue-700"
              }`}>
                {selectedRole === "admin" ? "Admin Registration" : "Property Manager"}
              </span>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={`h-12 rounded-xl ${errors.fullName ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-destructive">{errors.fullName}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="08012345678"
                    className={`h-12 rounded-xl ${errors.phone ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>

                {/* Company Name - Only for Landlords */}
                {selectedRole === "landlord" && (
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-sm font-medium">
                      Company/Agency Name <span className="text-muted-foreground">(Optional)</span>
                    </Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Your company or agency name"
                      className="h-12 rounded-xl"
                    />
                  </div>
                )}

                {/* Admin Code - Only for Admins */}
                {selectedRole === "admin" && (
                  <div className="space-y-2">
                    <Label htmlFor="adminCode" className="text-sm font-medium">
                      Admin Authorization Code
                    </Label>
                    <Input
                      id="adminCode"
                      name="adminCode"
                      type="password"
                      value={formData.adminCode}
                      onChange={handleInputChange}
                      placeholder="Enter admin code"
                      className={`h-12 rounded-xl ${errors.adminCode ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    />
                    {errors.adminCode && (
                      <p className="text-xs text-destructive">{errors.adminCode}</p>
                    )}
                  </div>
                )}

                {/* University / Area */}
                <div className="space-y-2">
                  <Label htmlFor="university" className="text-sm font-medium">
                    {selectedRole === "student" ? "University" : "Area of Operation"}
                  </Label>
                  <select
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    className={`w-full h-12 px-4 rounded-xl border bg-background text-foreground text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none cursor-pointer ${
                      errors.university ? "border-destructive" : "border-input"
                    }`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 12px center",
                      backgroundSize: "20px"
                    }}
                  >
                    <option value="">
                      {selectedRole === "student" ? "Select your university" : "Select area"}
                    </option>
                    {NIGERIAN_UNIVERSITIES.map(uni => (
                      <option key={uni} value={uni}>{uni}</option>
                    ))}
                  </select>
                  {errors.university && (
                    <p className="text-xs text-destructive">{errors.university}</p>
                  )}
                </div>
              </>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                className={`h-12 rounded-xl ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={isLogin ? "Enter your password" : "Create a password"}
                  className={`h-12 rounded-xl pr-12 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
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
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all mt-6" 
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

          {/* Toggle Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
              }}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? "Sign Up" : "Log In"}
            </button>
          </p>

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
      </main>
    </div>
  );
};

export default AuthPage;