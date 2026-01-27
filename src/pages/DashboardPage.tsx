import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  Home, 
  Building2, 
  CreditCard, 
  User as UserIcon,
  TrendingUp,
  CalendarCheck,
  MessageCircle,
  Headphones,
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import PropertyList from "@/components/dashboard/PropertyList";
import PropertyForm from "@/components/dashboard/PropertyForm";
import RoleSetup from "@/components/dashboard/RoleSetup";
import PaymentsView from "@/components/dashboard/PaymentsView";
import ProfileView from "@/components/dashboard/ProfileView";

interface DashboardStats {
  totalListings: number;
  activeBookings: number;
  totalEarnings: number;
  earningsGrowth: number;
}

interface Inquiry {
  id: string;
  name: string;
  property: string;
  time: string;
  avatar?: string;
  isNew?: boolean;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showPropertyList, setShowPropertyList] = useState(false);
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeBookings: 0,
    totalEarnings: 0,
    earningsGrowth: 12,
  });
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

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
        fetchDashboardData(session.user.id);
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

  const fetchDashboardData = async (userId: string) => {
    try {
      // Fetch properties for stats
      const { data: properties } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", userId);

      // Fetch bookings count
      const { count: bookingsCount } = await supabase
        .from("bookings")
        .select("*", { count: "exact", head: true });

      if (properties) {
        const totalEarnings = properties.reduce((sum, p) => sum + Number(p.price), 0);
        setStats({
          totalListings: properties.length,
          activeBookings: bookingsCount || 0,
          totalEarnings: totalEarnings,
          earningsGrowth: 12,
        });

        // Create mock recent inquiries based on properties
        const mockInquiries: Inquiry[] = [
          {
            id: "1",
            name: "Chinedu Okafor",
            property: properties[0]?.title || "Emerald Courts - UNILAG",
            time: "2m ago",
            isNew: true,
          },
          {
            id: "2",
            name: "Toluwalase Bakare",
            property: properties[1]?.title || "Grace Heights - UI",
            time: "1h ago",
          },
          {
            id: "3",
            name: "Blessing Nwosu",
            property: properties[2]?.title || "The Graduate Loft - UNIBEN",
            time: "3h ago",
          },
        ];
        setRecentInquiries(mockInquiries);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
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
    if (user) {
      fetchDashboardData(user.id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (email: string) => {
    return email?.substring(0, 2).toUpperCase() || "AG";
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

  // Show property form
  if (showPropertyForm) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <PropertyForm 
          user={user}
          property={editingProperty}
          onClose={handleFormClose}
        />
      </div>
    );
  }

  // Show property list (My Properties tab)
  if (activeTab === "properties") {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-4 py-4">
          <PropertyList user={user} onEdit={handleEditProperty} />
        </div>
        <DashboardBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  // Show payments view
  if (activeTab === "payments") {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-4 py-4">
          <PaymentsView user={user} />
        </div>
        <DashboardBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  // Show profile view
  if (activeTab === "profile") {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-4 py-4">
          <ProfileView user={user} onLogout={handleLogout} />
        </div>
        <DashboardBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Welcome Back</p>
            <h1 className="text-xl font-bold text-foreground">Agent Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-muted-foreground" />
            </button>
            <button 
              onClick={handleLogout}
              className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-destructive" />
            </button>
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
              {getInitials(user?.email || "")}
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Card */}
      <div className="px-4 mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-5 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute right-8 bottom-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2" />
          
          <p className="text-blue-100 text-sm mb-1">Total Earnings</p>
          <h2 className="text-3xl font-bold mb-3">{formatCurrency(stats.totalEarnings)}</h2>
          <div className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-sm">
            <TrendingUp className="w-3 h-3" />
            <span>+{stats.earningsGrowth}% this month</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setActiveTab("properties")}
            className="bg-background border border-border rounded-xl p-4 text-left hover:border-primary/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-3">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mb-1">Total Listings</p>
            <p className="text-2xl font-bold text-foreground">{stats.totalListings}</p>
          </button>
          
          <button 
            onClick={() => setActiveTab("payments")}
            className="bg-background border border-border rounded-xl p-4 text-left hover:border-primary/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-3">
              <CalendarCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <p className="text-xs text-muted-foreground mb-1">Active Bookings</p>
            <p className="text-2xl font-bold text-foreground">{stats.activeBookings}</p>
          </button>
        </div>
      </div>

      {/* Recent Inquiries */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Recent Inquiries</h3>
          <button className="text-sm text-primary font-medium">View All</button>
        </div>
        
        <div className="space-y-3">
          {recentInquiries.map((inquiry) => (
            <div 
              key={inquiry.id}
              className="flex items-center gap-3 bg-background border border-border rounded-xl p-3"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                {inquiry.avatar ? (
                  <img src={inquiry.avatar} alt={inquiry.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-medium text-muted-foreground">
                    {inquiry.name.split(" ").map(n => n[0]).join("")}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground text-sm">{inquiry.name}</h4>
                <p className="text-xs text-muted-foreground truncate">{inquiry.property}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-xs text-muted-foreground">{inquiry.time}</span>
                {inquiry.isNew && (
                  <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                    New
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support Card */}
      <div className="px-4 mb-6">
        <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-white text-sm">Need assistance?</h4>
              <p className="text-xs text-slate-400">Our support team is online 24/7</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="bg-white text-slate-800 hover:bg-slate-100">
            Chat Now
          </Button>
        </div>
      </div>

      {/* Add Property Button */}
      <div className="px-4 mb-6">
        <Button 
          onClick={() => setShowPropertyForm(true)}
          className="w-full gap-2 py-6 rounded-xl text-base"
        >
          <Plus className="w-5 h-5" />
          Add New Property
        </Button>
      </div>

      {/* Bottom Navigation */}
      <DashboardBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

// Bottom Navigation Component
const DashboardBottomNav = ({ 
  activeTab, 
  onTabChange 
}: { 
  activeTab: string; 
  onTabChange: (tab: string) => void;
}) => {
  const navigate = useNavigate();

  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "properties", label: "My Properties", icon: Building2 },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "profile", label: "Profile", icon: UserIcon },
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId === "home") {
      onTabChange(tabId);
    } else if (tabId === "properties") {
      onTabChange(tabId);
    } else {
      onTabChange(tabId);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-2 z-50">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
              activeTab === tab.id 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default DashboardPage;