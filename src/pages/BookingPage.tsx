import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getListingById } from "@/data/listings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User, Session } from "@supabase/supabase-js";

const SERVICE_FEE_PERCENT = 0.05;

interface Profile {
  full_name: string;
  email: string;
  phone: string;
  university: string;
}

interface ListingData {
  id: string | number;
  title: string;
  location: string;
  price: number;
  period: string;
  images: string[];
}

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "payment" | "confirmation">("form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [listing, setListing] = useState<ListingData | null>(null);
  
  const [formData, setFormData] = useState({
    moveInDate: ""
  });

  // Fetch listing from database or static data
  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;

      // First try to get from database (UUID format)
      const isUUID = id.length > 10;
      
      if (isUUID) {
        const { data, error } = await supabase
          .from("properties")
          .select("id, title, location, price, period, images")
          .eq("id", id)
          .maybeSingle();

        if (data) {
          setListing({
            id: data.id,
            title: data.title,
            location: data.location,
            price: data.price,
            period: data.period,
            images: data.images && data.images.length > 0 ? data.images : ["/placeholder.svg"],
          });
          return;
        }
      }

      // Fallback to static data for numeric IDs
      const staticListing = getListingById(Number(id));
      if (staticListing) {
        setListing({
          id: staticListing.id,
          title: staticListing.title,
          location: staticListing.location,
          price: staticListing.price,
          period: staticListing.period,
          images: staticListing.images,
        });
      }
    };

    fetchListing();
  }, [id]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session?.user) {
          navigate("/", { replace: true });
        } else {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate("/", { replace: true });
      } else {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, email, phone, university")
      .eq("id", userId)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
    setIsLoading(false);
  };

  if (!listing && !isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground mb-2">Listing not found</h1>
          <Button onClick={() => navigate("/")}>Go back home</Button>
        </div>
      </div>
    );
  }

  if (isLoading || !listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const rentAmount = listing.price;
  const serviceFee = rentAmount * SERVICE_FEE_PERCENT;
  const totalAmount = rentAmount + serviceFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile || !formData.moveInDate) {
      toast({
        title: "Missing Information",
        description: "Please select a move-in date",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert({
          listing_id: String(listing.id),
          student_name: profile.full_name,
          student_email: profile.email,
          student_phone: profile.phone,
          university: profile.university,
          rent_amount: rentAmount,
          service_fee: serviceFee,
          total_amount: totalAmount,
          move_in_date: formData.moveInDate,
          payment_status: "pending"
        })
        .select()
        .single();

      if (error) throw error;

      setBookingId(data.id);
      setStep("payment");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create booking",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSubmitted = async (paymentReference: string) => {
    if (!bookingId) return;

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          payment_status: "submitted",
          payment_reference: paymentReference
        })
        .eq("id", bookingId);

      if (error) throw error;

      setStep("confirmation");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit payment",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center gap-3 z-10">
        <button
          onClick={() => step === "form" ? navigate(-1) : setStep("form")}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">
          {step === "form" && "Book Property"}
          {step === "payment" && "Make Payment"}
          {step === "confirmation" && "Booking Confirmed"}
        </h1>
      </div>

      <div className="px-4 pt-4">
        {/* Property Summary */}
        <div className="bg-muted/50 rounded-xl p-4 mb-6">
          <div className="flex gap-3">
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-20 h-20 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-medium text-foreground">{listing.title}</h3>
              <p className="text-sm text-muted-foreground">{listing.location}</p>
            </div>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="bg-muted/30 rounded-xl p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Rent ({listing.period})</span>
            <span className="text-foreground">₦{rentAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Service Fee (5%)</span>
            <span className="text-foreground">₦{serviceFee.toLocaleString()}</span>
          </div>
          <div className="border-t border-border pt-2 flex justify-between font-semibold">
            <span className="text-foreground">Total</span>
            <span className="text-primary">₦{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Step Content */}
        {step === "form" && profile && (
          <BookingForm
            profile={profile}
            moveInDate={formData.moveInDate}
            onMoveInDateChange={handleInputChange}
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        )}

        {step === "payment" && (
          <PaymentStep
            totalAmount={totalAmount}
            onPaymentSubmitted={handlePaymentSubmitted}
            isSubmitting={isSubmitting}
          />
        )}

        {step === "confirmation" && (
          <ConfirmationStep
            bookingId={bookingId!}
            onGoHome={() => navigate("/")}
          />
        )}
      </div>
    </div>
  );
};

interface BookingFormProps {
  profile: Profile;
  moveInDate: string;
  onMoveInDateChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

const BookingForm = ({ profile, moveInDate, onMoveInDateChange, onSubmit, isSubmitting }: BookingFormProps) => (
  <form onSubmit={onSubmit} className="space-y-4">
    {/* User Info Summary (Read-only) */}
    <div className="bg-muted/50 rounded-xl p-4 space-y-3">
      <h3 className="font-medium text-foreground mb-2">Your Details</h3>
      <div className="grid gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Name</span>
          <span className="text-foreground font-medium">{profile.full_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Email</span>
          <span className="text-foreground font-medium">{profile.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Phone</span>
          <span className="text-foreground font-medium">{profile.phone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">University</span>
          <span className="text-foreground font-medium">{profile.university}</span>
        </div>
      </div>
    </div>

    <div>
      <Label htmlFor="moveInDate">Preferred Move-in Date</Label>
      <Input
        id="moveInDate"
        name="moveInDate"
        type="date"
        value={moveInDate}
        onChange={onMoveInDateChange}
        min={new Date().toISOString().split("T")[0]}
        required
      />
    </div>

    <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
      {isSubmitting ? "Processing..." : "Proceed to Payment"}
    </Button>
  </form>
);

interface PaymentStepProps {
  totalAmount: number;
  onPaymentSubmitted: (reference: string) => void;
  isSubmitting: boolean;
}

const PaymentStep = ({ totalAmount, onPaymentSubmitted, isSubmitting }: PaymentStepProps) => {
  const [paymentReference, setPaymentReference] = useState("");

  return (
    <div className="space-y-6">
      {/* Bank Details */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Bank Transfer Details</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Bank Name</span>
            <span className="text-sm font-medium text-foreground">First Bank Nigeria</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Account Number</span>
            <span className="text-sm font-medium text-foreground font-mono">3087654321</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Account Name</span>
            <span className="text-sm font-medium text-foreground">StudentHomes Nigeria Ltd</span>
          </div>
          <div className="flex justify-between border-t border-border pt-3">
            <span className="text-sm font-medium text-foreground">Amount to Pay</span>
            <span className="text-lg font-bold text-primary">₦{totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-muted/50 rounded-xl p-4">
        <h4 className="font-medium text-foreground mb-2">Payment Instructions</h4>
        <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
          <li>Transfer the exact amount shown above to the account</li>
          <li>Use your email as the payment reference/narration</li>
          <li>After payment, enter your transaction reference below</li>
          <li>Your booking will be verified within 24-48 hours</li>
        </ol>
      </div>

      {/* Payment Reference Input */}
      <div>
        <Label htmlFor="paymentReference">Transaction Reference / Receipt Number</Label>
        <Input
          id="paymentReference"
          value={paymentReference}
          onChange={(e) => setPaymentReference(e.target.value)}
          placeholder="Enter your transaction reference"
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          This is the reference number from your bank transfer receipt
        </p>
      </div>

      <Button
        onClick={() => onPaymentSubmitted(paymentReference)}
        className="w-full"
        size="lg"
        disabled={!paymentReference || isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "I Have Made Payment"}
      </Button>
    </div>
  );
};

interface ConfirmationStepProps {
  bookingId: string;
  onGoHome: () => void;
}

const ConfirmationStep = ({ bookingId, onGoHome }: ConfirmationStepProps) => (
  <div className="text-center space-y-6 py-8">
    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
      <CheckCircle className="w-10 h-10 text-green-600" />
    </div>

    <div>
      <h2 className="text-xl font-semibold text-foreground mb-2">Payment Submitted!</h2>
      <p className="text-muted-foreground">
        Your booking request has been received. We will verify your payment and get back to you shortly.
      </p>
    </div>

    <div className="bg-muted/50 rounded-xl p-4 inline-block">
      <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
      <p className="font-mono font-semibold text-foreground">{bookingId.slice(0, 8).toUpperCase()}</p>
    </div>

    <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 rounded-lg p-3">
      <Clock className="w-5 h-5" />
      <span className="text-sm font-medium">Verification typically takes 24-48 hours</span>
    </div>

    <Button onClick={onGoHome} variant="outline" size="lg" className="w-full">
      Back to Home
    </Button>
  </div>
);

export default BookingPage;
