import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { CreditCard, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react";

interface Booking {
  id: string;
  student_name: string;
  student_email: string;
  total_amount: number;
  payment_status: string;
  inspection_status: string | null;
  created_at: string;
  move_in_date: string;
  listing_id: string;
}

interface PaymentsViewProps {
  user: User | null;
}

const PaymentsView = ({ user }: PaymentsViewProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    completedPayments: 0,
  });

  useEffect(() => {
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const fetchPayments = async () => {
    try {
      // Get properties owned by this user first
      const { data: properties } = await supabase
        .from("properties")
        .select("id")
        .eq("owner_id", user?.id);

      const propertyIds = properties?.map(p => p.id) || [];

      if (propertyIds.length > 0) {
        // Fetch bookings for this agent's properties
        const { data: bookingsData } = await supabase
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false });

        // Filter to only this agent's property bookings
        const agentBookings = bookingsData?.filter(b => propertyIds.includes(b.listing_id)) || [];

        if (agentBookings.length > 0) {
          setBookings(agentBookings);
          
          // Total revenue = verified payments (inspection passed) - rent amount only
          const totalRevenue = agentBookings
            .filter(b => b.payment_status === "verified")
            .reduce((sum, b) => sum + Number(b.rent_amount), 0);
          
          // Pending payments = awaiting inspection (submitted/pending but not failed) - rent amount only
          const pendingPayments = agentBookings
            .filter(b => (b.payment_status === "pending" || b.payment_status === "submitted") && b.inspection_status !== "rejected")
            .reduce((sum, b) => sum + Number(b.rent_amount), 0);
          
          const completedPayments = agentBookings.filter(b => b.payment_status === "verified").length;

          setStats({
            totalRevenue,
            pendingPayments,
            completedPayments,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusIcon = (booking: Booking) => {
    if (booking.payment_status === "rejected" || booking.inspection_status === "rejected") {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    switch (booking.payment_status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "pending":
      case "submitted":
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (booking: Booking) => {
    if (booking.payment_status === "rejected" || booking.inspection_status === "rejected") {
      return "bg-red-100 text-red-700";
    }
    const styles: Record<string, string> = {
      verified: "bg-emerald-100 text-emerald-700",
      pending: "bg-amber-100 text-amber-700",
      submitted: "bg-amber-100 text-amber-700",
      rejected: "bg-red-100 text-red-700",
    };
    return styles[booking.payment_status] || "bg-muted text-muted-foreground";
  };
  
  const getDisplayStatus = (booking: Booking) => {
    if (booking.payment_status === "rejected" || booking.inspection_status === "rejected") {
      return "Failed";
    }
    if (booking.payment_status === "verified") {
      return "Released";
    }
    if (booking.payment_status === "pending" || booking.payment_status === "submitted") {
      return "Pending Inspection";
    }
    return booking.payment_status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-foreground">Payments</h2>
        <p className="text-sm text-muted-foreground">Track your earnings and payment history</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs text-emerald-100">Total Revenue</span>
          </div>
          <p className="text-xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
        </div>
        
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs text-amber-100">Pending</span>
          </div>
          <p className="text-xl font-bold">{formatCurrency(stats.pendingPayments)}</p>
        </div>
      </div>

      {/* Transactions List */}
      <div>
        <h3 className="font-semibold text-foreground mb-4">Recent Transactions</h3>
        
        {bookings.length === 0 ? (
          <div className="text-center py-12 bg-muted/50 rounded-xl">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No transactions yet</p>
            <p className="text-sm text-muted-foreground">Payments will appear here when students book your properties</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div 
                key={booking.id}
                className="bg-background border border-border rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-foreground">{booking.student_name}</h4>
                    <p className="text-xs text-muted-foreground">{booking.student_email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getStatusBadge(booking)}`}>
                    {getStatusIcon(booking)}
                    {getDisplayStatus(booking)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Move-in: {formatDate(booking.move_in_date)}
                  </span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(booking.total_amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsView;
