import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { 
  ArrowLeft, 
  Building2, 
  Clock, 
  ChevronRight, 
  CalendarCheck,
  CheckCircle,
  Search as SearchIcon,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

interface Booking {
  id: string;
  listing_id: string;
  student_name: string;
  move_in_date: string;
  payment_status: string;
  inspection_status: string | null;
  total_amount: number;
  created_at: string;
}

const BookingsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

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
        navigate("/auth");
      } else {
        fetchBookings(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchBookings = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("student_email", currentUser.email)
        .order("created_at", { ascending: false });

      if (data) setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
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

  const getStatusInfo = (paymentStatus: string, inspectionStatus: string | null) => {
    if (inspectionStatus === "approved") {
      return { label: "Completed", color: "bg-primary/20 text-primary", icon: CheckCircle };
    }
    if (inspectionStatus === "rejected") {
      return { label: "Rejected", color: "bg-red-100 text-red-700", icon: AlertCircle };
    }
    if (inspectionStatus === "in_progress" || inspectionStatus === "scheduled") {
      return { label: "Inspecting", color: "bg-blue-100 text-blue-700", icon: SearchIcon };
    }
    if (paymentStatus === "verified" || inspectionStatus === "payment_verified") {
      return { label: "Verified", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle };
    }
    return { label: "Pending", color: "bg-amber-100 text-amber-700", icon: Clock };
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true;
    if (filter === "completed") return booking.inspection_status === "approved";
    if (filter === "pending") return booking.inspection_status !== "approved";
    return true;
  });

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
      <div className="sticky top-0 bg-background border-b border-border px-4 py-3 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">My Bookings</h1>
            <p className="text-xs text-muted-foreground">{bookings.length} total bookings</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex gap-2">
          {[
            { id: "all", label: "All" },
            { id: "pending", label: "In Progress" },
            { id: "completed", label: "Completed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-4">
        {filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-1">
              {filter === "all" ? "No bookings yet" : `No ${filter} bookings`}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {filter === "all" 
                ? "Start exploring hostels to make your first booking"
                : "Check back later or try a different filter"}
            </p>
            {filter === "all" && (
              <Button onClick={() => navigate("/explore")} size="sm">
                <SearchIcon className="w-4 h-4 mr-2" />
                Explore Hostels
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBookings.map((booking) => {
              const statusInfo = getStatusInfo(booking.payment_status, booking.inspection_status);
              const StatusIcon = statusInfo.icon;

              return (
                <button
                  key={booking.id}
                  onClick={() => navigate(`/booking-detail/${booking.id}`)}
                  className="w-full bg-background border border-border rounded-xl p-4 hover:border-primary/50 transition-colors text-left"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-foreground">
                            Booking #{booking.id.slice(0, 8).toUpperCase()}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Clock className="w-3 h-3" />
                            <span>Move-in: {new Date(booking.move_in_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                        <span className="font-semibold text-foreground">
                          {formatCurrency(booking.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress indicator for pending bookings */}
                  {booking.inspection_status !== "approved" && booking.inspection_status !== "rejected" && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ 
                              width: booking.inspection_status === "payment_verified" ? "25%" 
                                : booking.inspection_status === "scheduled" ? "50%"
                                : booking.inspection_status === "in_progress" ? "75%"
                                : "10%"
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {booking.inspection_status === "payment_verified" ? "Payment Verified"
                            : booking.inspection_status === "scheduled" ? "Inspection Scheduled"
                            : booking.inspection_status === "in_progress" ? "Being Inspected"
                            : "Awaiting Verification"}
                        </span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default BookingsPage;
