import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  Heart, 
  CalendarCheck, 
  MapPin,
  Clock,
  ChevronRight,
  GraduationCap,
  Building2,
  Headphones
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

interface Booking {
  id: string;
  listing_id: string;
  student_name: string;
  move_in_date: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
}

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate("/", { replace: true });
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/", { replace: true });
      } else {
        fetchData(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchData = async (currentUser: User) => {
    try {
      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profileData) setProfile(profileData);

      // Fetch bookings
      const { data: bookingsData } = await supabase
        .from("bookings")
        .select("*")
        .eq("student_email", currentUser.email)
        .order("created_at", { ascending: false })
        .limit(5);

      if (bookingsData) setBookings(bookingsData);

      // Get wishlist count from localStorage
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setWishlistCount(wishlist.length);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getInitials = (name: string) => {
    return name?.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) || "ST";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-[hsl(111,100%,60%)] text-primary-foreground px-4 pt-6 pb-16">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-foreground/80 text-xs uppercase tracking-wide">Welcome Back</p>
            <h1 className="text-xl font-bold">{profile?.full_name || "Student"}</h1>
          </div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-lg font-bold">{getInitials(profile?.full_name || "")}</span>
          </div>
        </div>
        
        {/* University Badge */}
        {profile?.university && (
          <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1.5 w-fit">
            <GraduationCap className="w-4 h-4" />
            <span className="text-sm">{profile.university}</span>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="px-4 -mt-10">
        <div className="bg-background rounded-2xl shadow-lg p-4">
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/explore")}
              className="flex flex-col items-center p-3 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Find</span>
              <span className="text-sm font-semibold">Hostels</span>
            </button>

            <button
              onClick={() => navigate("/wishlists")}
              className="flex flex-col items-center p-3 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center mb-2">
                <Heart className="w-5 h-5 text-rose-500" />
              </div>
              <span className="text-xs text-muted-foreground">Saved</span>
              <span className="text-sm font-semibold">{wishlistCount}</span>
            </button>

            <div className="flex flex-col items-center p-3 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <CalendarCheck className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Bookings</span>
              <span className="text-sm font-semibold">{bookings.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* My Bookings */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-foreground">My Bookings</h2>
          {bookings.length > 0 && (
            <button className="text-sm text-primary font-medium">View All</button>
          )}
        </div>

        {bookings.length === 0 ? (
          <div className="bg-muted/50 rounded-xl p-6 text-center">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium text-foreground mb-1">No bookings yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start exploring hostels near your campus
            </p>
            <Button onClick={() => navigate("/explore")} size="sm">
              <Search className="w-4 h-4 mr-2" />
              Explore Hostels
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <button
                key={booking.id}
                onClick={() => navigate(`/booking-detail/${booking.id}`)}
                className="w-full bg-background border border-border rounded-xl p-4 flex items-center gap-3 hover:border-primary/50 transition-colors text-left"
              >
                <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">Booking #{booking.id.slice(0, 8)}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(booking.move_in_date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm text-foreground">
                    {formatCurrency(booking.total_amount)}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                    booking.payment_status === "verified"
                      ? "bg-primary/20 text-primary"
                      : booking.payment_status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {booking.payment_status === "verified" 
                      ? "Completed" 
                      : booking.payment_status === "rejected"
                      ? "Failed"
                      : "Pending Inspection"}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-4 mt-6">
        <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
        
        <div className="space-y-3">
          <button
            onClick={() => navigate("/explore")}
            className="w-full flex items-center justify-between p-4 bg-background border border-border rounded-xl hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground text-sm">Find Hostels Near Me</p>
                <p className="text-xs text-muted-foreground">Browse available accommodations</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>

          <button
            onClick={() => navigate("/wishlists")}
            className="w-full flex items-center justify-between p-4 bg-background border border-border rounded-xl hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
                <Heart className="w-5 h-5 text-rose-500" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground text-sm">My Wishlist</p>
                <p className="text-xs text-muted-foreground">{wishlistCount} saved properties</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Support Card */}
      <div className="px-4 mt-6">
        <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-white text-sm">Need help?</h4>
              <p className="text-xs text-slate-400">We're here to assist you</p>
            </div>
          </div>
          <Button variant="secondary" size="sm" className="bg-white text-slate-800 hover:bg-slate-100">
            Contact Us
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default StudentDashboard;