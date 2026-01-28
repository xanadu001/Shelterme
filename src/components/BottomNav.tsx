import { Search, Heart, User, LayoutDashboard, Headphones } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const getActiveTab = () => {
    if (location.pathname === "/explore" || location.pathname.startsWith("/listing")) return "explore";
    if (location.pathname === "/wishlists") return "wishlists";
    if (location.pathname === "/dashboard" || location.pathname === "/student-dashboard" || location.pathname === "/admin-dashboard") return "dashboard";
    if (location.pathname === "/support") return "support";
    if (location.pathname === "/profile") return "profile";
    return "explore";
  };

  const activeTab = getActiveTab();

  const getDashboardRoute = () => {
    switch (userRole) {
      case "student":
        return "/student-dashboard";
      case "landlord":
      case "agent":
        return "/dashboard";
      case "admin":
        return "/admin-dashboard";
      default:
        return "/explore";
    }
  };

  const handleNavClick = (id: string) => {
    if (id === "login") {
      navigate("/auth");
    } else if (id === "wishlists") {
      navigate("/wishlists");
    } else if (id === "explore") {
      navigate("/explore");
    } else if (id === "dashboard") {
      navigate(getDashboardRoute());
    } else if (id === "support") {
      navigate("/support");
    } else if (id === "profile") {
      navigate("/profile");
    }
  };

  // Show dashboard for all logged-in users
  const showDashboard = userRole !== null;

  const navItems = user
    ? [
        { id: "explore", icon: Search, label: "Explore" },
        { id: "wishlists", icon: Heart, label: "Wishlists" },
        ...(showDashboard ? [{ id: "dashboard", icon: LayoutDashboard, label: "Dashboard" }] : []),
        { id: "support", icon: Headphones, label: "Support" },
        { id: "profile", icon: User, label: "Profile" },
      ]
    : [
        { id: "explore", icon: Search, label: "Explore" },
        { id: "wishlists", icon: Heart, label: "Wishlists" },
        { id: "support", icon: Headphones, label: "Support" },
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