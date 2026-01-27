import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Building2, 
  CalendarCheck, 
  TrendingUp,
  Shield,
  Settings,
  BarChart3,
  CheckCircle,
  XCircle,
  Eye,
  AlertTriangle
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalProperties: number;
  totalBookings: number;
  pendingVerifications: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalProperties: 0,
    totalBookings: 0,
    pendingVerifications: 0,
  });
  const [recentProperties, setRecentProperties] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

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
        fetchAdminData();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchAdminData = async () => {
    try {
      // Fetch total properties
      const { count: propertiesCount } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true });

      // Fetch pending verifications
      const { count: pendingCount } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("is_verified", false);

      // Fetch total bookings
      const { count: bookingsCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true });

      // Fetch total users (profiles)
      const { count: usersCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Fetch recent properties for verification
      const { data: properties } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      setStats({
        totalUsers: usersCount || 0,
        totalProperties: propertiesCount || 0,
        totalBookings: bookingsCount || 0,
        pendingVerifications: pendingCount || 0,
      });

      setRecentProperties(properties || []);

    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProperty = async (propertyId: string, verified: boolean) => {
    try {
      await supabase
        .from("properties")
        .update({ is_verified: verified })
        .eq("id", propertyId);

      setRecentProperties(prev =>
        prev.map(p => p.id === propertyId ? { ...p, is_verified: verified } : p)
      );
      
      fetchAdminData();
    } catch (error) {
      console.error("Error updating property:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getInitials = (email: string) => {
    return email?.substring(0, 2).toUpperCase() || "AD";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-emerald-500" },
    { title: "Properties", value: stats.totalProperties, icon: Building2, color: "bg-emerald-600" },
    { title: "Bookings", value: stats.totalBookings, icon: CalendarCheck, color: "bg-emerald-700" },
    { title: "Pending Review", value: stats.pendingVerifications, icon: AlertTriangle, color: "bg-amber-500" },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-slate-900 text-white px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Admin Dashboard</h1>
              <p className="text-xs text-slate-400">Platform Management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-medium">
              {getInitials(user?.email || "")}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-background border-b border-border px-4">
        <div className="flex gap-1">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "properties", label: "Properties", icon: Building2 },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="p-4 space-y-6">
        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {statCards.map((stat, index) => (
                <div key={index} className="bg-background rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Growth Card */}
            <div className="bg-gradient-to-r from-primary to-emerald-500 rounded-xl p-5 text-white">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Platform Growth</span>
              </div>
              <p className="text-2xl font-bold">+24%</p>
              <p className="text-sm text-white/80">New users this month</p>
            </div>
          </>
        )}

        {activeTab === "properties" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Property Management</h2>
              <span className="text-sm text-muted-foreground">
                {stats.pendingVerifications} pending
              </span>
            </div>

            {recentProperties.length === 0 ? (
              <div className="bg-background rounded-xl p-8 text-center border border-border">
                <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No properties to review</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProperties.map((property) => (
                  <div
                    key={property.id}
                    className="bg-background rounded-xl p-4 border border-border"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {property.images?.[0] ? (
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium text-foreground text-sm line-clamp-1">
                              {property.title}
                            </h3>
                            <p className="text-xs text-muted-foreground">{property.location}</p>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                            property.is_verified
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {property.is_verified ? "Verified" : "Pending"}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            onClick={() => navigate(`/listing/${property.id}`)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          {!property.is_verified && (
                            <>
                              <Button
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => handleVerifyProperty(property.id, true)}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8 text-xs"
                                onClick={() => handleVerifyProperty(property.id, false)}
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-4">
            <h2 className="font-semibold text-foreground">Admin Settings</h2>
            
            <div className="bg-background rounded-xl border border-border divide-y divide-border">
              <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-foreground text-sm">Security Settings</span>
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-foreground text-sm">User Management</span>
                </div>
              </button>
              <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium text-foreground text-sm">Analytics</span>
                </div>
              </button>
            </div>

            <Button
              variant="outline"
              className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;