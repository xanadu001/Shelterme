import { Search, Heart, User, LogOut, Home, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          checkUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkUserRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();
      setUserRole(data?.role || null);
    } catch (error) {
      console.error("Error checking role:", error);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out"
      });
      navigate("/");
    }
  };

  const getActiveTab = () => {
    if (location.pathname === "/") return "home";
    if (location.pathname === "/explore" || location.pathname.startsWith("/listing")) return "explore";
    if (location.pathname === "/wishlists") return "wishlists";
    if (location.pathname === "/dashboard") return "dashboard";
    return "explore";
  };

  const activeTab = getActiveTab();

  const handleNavClick = (id: string) => {
    if (id === "home") {
      navigate("/");
    } else if (id === "login") {
      navigate("/auth");
    } else if (id === "logout") {
      handleLogout();
    } else if (id === "wishlists") {
      navigate("/wishlists");
    } else if (id === "explore") {
      navigate("/explore");
    } else if (id === "dashboard") {
      navigate("/dashboard");
    }
  };

  // Show dashboard option for landlords/agents
  const isLandlordOrAgent = userRole === "landlord" || userRole === "agent";

  const navItems = user
    ? [
        { id: "home", icon: Home, label: "Home" },
        { id: "explore", icon: Search, label: "Explore" },
        { id: "wishlists", icon: Heart, label: "Wishlists" },
        ...(isLandlordOrAgent ? [{ id: "dashboard", icon: LayoutDashboard, label: "Dashboard" }] : []),
        { id: "logout", icon: LogOut, label: "Log out" },
      ]
    : [
        { id: "home", icon: Home, label: "Home" },
        { id: "explore", icon: Search, label: "Explore" },
        { id: "wishlists", icon: Heart, label: "Wishlists" },
        { id: "login", icon: User, label: "Log in" },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center py-2 max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={`flex flex-col items-center gap-1 py-2 px-6 transition-colors ${
              activeTab === item.id ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <item.icon
              className={`w-6 h-6 ${
                activeTab === item.id ? "stroke-[2.5]" : "stroke-[1.5]"
              }`}
            />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;