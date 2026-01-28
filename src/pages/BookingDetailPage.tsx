import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Phone, Mail, Calendar, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import BookingStatusTracker from "@/components/BookingStatusTracker";

interface BookingDetail {
  id: string;
  listing_id: string;
  student_name: string;
  student_email: string;
  student_phone: string;
  university: string;
  rent_amount: number;
  service_fee: number;
  total_amount: number;
  move_in_date: string;
  payment_status: string;
  payment_reference: string | null;
  inspection_status: string;
  inspection_date: string | null;
  inspection_notes: string | null;
  created_at: string;
}

interface PropertyInfo {
  id: string;
  title: string;
  location: string;
  images: string[] | null;
}

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [property, setProperty] = useState<PropertyInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (data) {
        setBooking(data);
        
        // Try to fetch property info
        if (data.listing_id) {
          const { data: propData } = await supabase
            .from("properties")
            .select("id, title, location, images")
            .eq("id", data.listing_id)
            .maybeSingle();
          
          if (propData) {
            setProperty(propData);
          }
        }
      }
      
      setLoading(false);
    };

    fetchBooking();
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground mb-2">Booking not found</h1>
          <Button onClick={() => navigate(-1)}>Go back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center gap-3 z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Booking Details</h1>
          <p className="text-xs text-muted-foreground">#{booking.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-6">
        {/* Property Info */}
        <div className="bg-muted/50 rounded-xl p-4">
          <div className="flex gap-3">
            {property?.images?.[0] ? (
              <img
                src={property.images[0]}
                alt={property.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-medium text-foreground">
                {property?.title || `Property #${booking.listing_id.slice(0, 8)}`}
              </h3>
              {property?.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{property.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Move-in: {new Date(booking.move_in_date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Tracker */}
        <div className="bg-background border border-border rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-4">Booking Status</h3>
          <BookingStatusTracker
            paymentStatus={booking.payment_status}
            inspectionStatus={booking.inspection_status || "pending"}
            inspectionDate={booking.inspection_date || undefined}
            inspectionNotes={booking.inspection_notes || undefined}
          />
        </div>

        {/* Payment Details */}
        <div className="bg-muted/30 rounded-xl p-4">
          <h3 className="font-semibold text-foreground mb-3">Payment Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Rent Amount</span>
              <span className="text-foreground">{formatCurrency(booking.rent_amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service Fee (5%)</span>
              <span className="text-foreground">{formatCurrency(booking.service_fee)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-semibold">
              <span className="text-foreground">Total Paid</span>
              <span className="text-primary">{formatCurrency(booking.total_amount)}</span>
            </div>
          </div>
          
          {booking.payment_reference && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">Payment Reference</p>
              <p className="font-mono text-sm text-foreground">{booking.payment_reference}</p>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
          <h4 className="font-medium text-foreground mb-2">Need help with this booking?</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Our support team is ready to assist you with any questions.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/support")}
              className="flex-1"
            >
              <Phone className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = `mailto:support@shelterme.ng?subject=Booking ${booking.id.slice(0, 8)}`}
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;
