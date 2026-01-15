import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Home, BarChart3, Settings, LogOut, Building2, Eye, MessageSquare, CheckCircle } from "lucide-react";
import PropertyList from "@/components/dashboard/PropertyList";
import PropertyForm from "@/components/dashboard/PropertyForm";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RoleSetup from "@/components/dashboard/RoleSetup";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      } else {
        checkUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (data) {
        setUserRole(data.role);
      }
    } catch (error) {
      console.error("Error checking role:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleRoleSet = (role: string) => {
    setUserRole(role);
  };

  const handleEditProperty = (property: any) => {
    setEditingProperty(property);
    setShowPropertyForm(true);
  };

  const handleFormClose = () => {
    setShowPropertyForm(false);
    setEditingProperty(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user hasn't set their role yet
  if (!userRole || userRole === "student") {
    return <RoleSetup user={user} onRoleSet={handleRoleSet} />;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-background border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-lg font-bold text-foreground">Property Dashboard</h1>
                <p className="text-xs text-muted-foreground capitalize">{userRole} Account</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate("/explore")}>
                <Home className="h-4 w-4 mr-2" />
                View Listings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="properties" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-background">
              <TabsTrigger value="properties" className="gap-2">
                <Home className="h-4 w-4" />
                Properties
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>
            
            <Button onClick={() => setShowPropertyForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Property
            </Button>
          </div>

          <TabsContent value="properties" className="space-y-6">
            {showPropertyForm ? (
              <PropertyForm 
                user={user}
                property={editingProperty}
                onClose={handleFormClose}
              />
            ) : (
              <PropertyList 
                user={user} 
                onEdit={handleEditProperty}
              />
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <DashboardStats user={user} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DashboardPage;
