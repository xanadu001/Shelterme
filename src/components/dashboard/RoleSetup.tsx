import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Home, User as UserIcon, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface RoleSetupProps {
  user: User | null;
  onRoleSet: (role: string) => void;
}

const RoleSetup = ({ user, onRoleSet }: RoleSetupProps) => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<"landlord" | "agent" | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedRole) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("user_roles").insert({
        user_id: user.id,
        role: selectedRole,
        company_name: companyName || null,
        phone: phone || null,
      });

      if (error) throw error;

      toast.success("Account setup complete!");
      onRoleSet(selectedRole);
    } catch (error: any) {
      toast.error(error.message || "Failed to setup account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>

        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to the Dashboard</CardTitle>
            <CardDescription>
              Tell us about yourself to get started listing properties
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">I am a...</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("landlord")}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      selectedRole === "landlord"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Home className={`h-8 w-8 mb-3 ${selectedRole === "landlord" ? "text-primary" : "text-muted-foreground"}`} />
                    <h3 className="font-semibold text-foreground">Landlord</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      I own properties and want to rent them out
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole("agent")}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      selectedRole === "agent"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <UserIcon className={`h-8 w-8 mb-3 ${selectedRole === "agent" ? "text-primary" : "text-muted-foreground"}`} />
                    <h3 className="font-semibold text-foreground">Agent</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      I manage properties for multiple landlords
                    </p>
                  </button>
                </div>
              </div>

              {selectedRole && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  {selectedRole === "agent" && (
                    <div className="space-y-2">
                      <Label htmlFor="company">Lodge Name</Label>
                      <Input
                        id="company"
                        placeholder="e.g. Sunshine Lodge"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g. 08012345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? "Setting up..." : "Continue to Dashboard"}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoleSetup;
