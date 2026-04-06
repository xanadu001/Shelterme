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
  AlertCircle,
  Handshake,
  Home,
  Trash2,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { toast } from "@/hooks/use-toast";

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

interface SharedSpace {
  id: string;
  title: string;
  location: string;
  price: number;
  period: string;
  images: string[] | null;
  is_available: boolean | null;
  created_at: string;
}

const BookingsPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [personalBookings, setPersonalBookings] = useState<Booking[]>([]);
  const [spaceBookings, setSpaceBookings] = useState<Booking[]>([]);
  const [ownedSpaces, setOwnedSpaces] = useState<SharedSpace[]>([]);
  const [section, setSection] = useState<"personal" | "shared">("personal");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [deletingSpaceId, setDeletingSpaceId] = useState<string | null>(null);

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
        fetchBookings(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchBookings = async (currentUser: User) => {
    try {
      const { data: ownBookings } = await supabase
        .from("bookings")
        .select("*")
        .eq("student_email", currentUser.email)
        .order("created_at", { ascending: false });

      setPersonalBookings(ownBookings || []);

      // Fetch owned shared spaces
      const { data: spaces } = await supabase
        .from("shared_spaces")
        .select("id, title, location, price, period, images, is_available, created_at")
        .eq("owner_id", currentUser.id)
        .order("created_at", { ascending: false });

      setOwnedSpaces(spaces || []);

      if (spaces && spaces.length > 0) {
        const spaceIds = spaces.map((s) => s.id);
        const { data } = await supabase
          .from("bookings")
          .select("*")
          .in("listing_id", spaceIds)
          .order("created_at", { ascending: false });
        setSpaceBookings(data || []);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSpace = async (spaceId: string) => {
    setDeletingSpaceId(spaceId);
    try {
      const hasBookings = spaceBookings.some(b => b.listing_id === spaceId);
      if (hasBookings) {
        toast({
          title: "Cannot delete",
          description: "This space has active bookings. You cannot delete it.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("shared_spaces")
        .delete()
        .eq("id", spaceId);

      if (error) throw error;

      setOwnedSpaces(prev => prev.filter(s => s.id !== spaceId));
      toast({ title: "Space deleted", description: "Your shared space has been removed." });
    } catch (error) {
      console.error("Error deleting space:", error);
      toast({ title: "Error", description: "Failed to delete the space.", variant: "destructive" });
    } finally {
      setDeletingSpaceId(null);
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

  const filteredPersonalBookings = personalBookings.filter((booking) => {
    if (filter === "all") return true;
    if (filter === "completed") return booking.inspection_status === "approved";
    if (filter === "pending") return booking.inspection_status !== "approved";
    return true;
  });

  const totalCount = personalBookings.length + ownedSpaces.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getSpaceBookingStatus = (spaceId: string) => {
    const booking = spaceBookings.find(b => b.listing_id === spaceId);
    if (!booking) return null;
    return booking;
  };

  const renderBookingCard = (booking: Booking) => {
    const statusInfo = getStatusInfo(booking.payment_status, booking.inspection_status);
    const StatusIcon = statusInfo.icon;

    return (
      <button
        key={booking.id}
        onClick={() => navigate(`/booking-detail/${booking.id}`)}
        className="w-full bg-background border border-border rounded-xl p-4 hover:border-primary/50 transition-colors text-left"
      >
        <div className="flex items-start gap-3">
          <div className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 bg-muted">
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
  };

  const renderSpaceCard = (space: SharedSpace) => {
    const booking = getSpaceBookingStatus(space.id);
    const isBooked = !!booking;
    const isDeleting = deletingSpaceId === space.id;

    return (
      <div
        key={space.id}
        className="bg-background border border-border rounded-xl p-4 transition-colors"
      >
        <div className="flex items-start gap-3">
          {/* Thumbnail */}
          <div className="w-14 h-14 rounded-lg flex-shrink-0 overflow-hidden bg-accent/20">
            {space.images && space.images.length > 0 ? (
              <img src={space.images[0]} alt={space.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Handshake className="w-6 h-6 text-accent-foreground" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-foreground truncate">{space.title}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{space.location}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3">
              {isBooked ? (
                <span className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1 bg-primary/20 text-primary">
                  <CheckCircle className="w-3 h-3" />
                  Booked
                </span>
              ) : (
                <span className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1 bg-amber-100 text-amber-700">
                  <Clock className="w-3 h-3" />
                  Not Booked Yet
                </span>
              )}
              <span className="font-semibold text-foreground">
                {formatCurrency(space.price)}/{space.period}
              </span>
            </div>
          </div>
        </div>

        {/* Booking info or actions */}
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
          {isBooked ? (
            <button
              onClick={() => navigate(`/booking-detail/${booking.id}`)}
              className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
            >
              View booking details
              <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
            <span className="text-xs text-muted-foreground">Awaiting a student to book</span>
          )}

          {!isBooked && (
            <button
              onClick={() => handleDeleteSpace(space.id)}
              disabled={isDeleting}
              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>
    );
  };

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
            <p className="text-xs text-muted-foreground">{totalCount} total</p>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="px-4 pt-3 pb-2 border-b border-border">
        <div className="flex rounded-lg bg-muted p-1 gap-1">
          <button
            onClick={() => { setSection("personal"); setFilter("all"); }}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              section === "personal"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home className="w-4 h-4" />
            My Bookings
            {personalBookings.length > 0 && (
              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                {personalBookings.length}
              </span>
            )}
          </button>
          <button
            onClick={() => { setSection("shared"); setFilter("all"); }}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
              section === "shared"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Handshake className="w-4 h-4" />
            My Space
            {ownedSpaces.length > 0 && (
              <span className="text-xs bg-accent/20 text-accent-foreground px-1.5 py-0.5 rounded-full">
                {ownedSpaces.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Filter Tabs - only for personal bookings */}
      {section === "personal" && (
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
      )}

      <div className="px-4 pt-4">
        {section === "personal" ? (
          filteredPersonalBookings.length === 0 ? (
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
              {filteredPersonalBookings.map(renderBookingCard)}
            </div>
          )
        ) : (
          ownedSpaces.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Handshake className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-1">No shared spaces yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Share your space with other students and it will appear here
              </p>
              <Button onClick={() => navigate("/share-space")} size="sm">
                <Handshake className="w-4 h-4 mr-2" />
                Share a Space
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {ownedSpaces.map(renderSpaceCard)}
            </div>
          )
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default BookingsPage;
