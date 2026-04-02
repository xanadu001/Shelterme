import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share, MapPin, Star, Grid3X3, ShieldCheck, AlertTriangle, Play, Clock, CheckCircle2, Zap, Wifi, Shield, Dumbbell, Droplets, WashingMachine, ChevronDown, Globe, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getListingById } from "@/data/listings";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PropertyData {
  id: string;
  title: string;
  description: string;
  location: string;
  university: string;
  price: number;
  period: string;
  bedrooms: number;
  bathrooms: number;
  size: string | null;
  amenities: string[] | null;
  images: string[] | null;
  videos: string[] | null;
  is_verified: boolean | null;
  is_available: boolean | null;
}

type BookingStatusType = "none" | "pending" | "approved";

const amenityIcons: Record<string, React.ReactNode> = {
  "24/7 Power": <Zap className="w-5 h-5" />,
  "24/7 power": <Zap className="w-5 h-5" />,
  "Prepaid Meter": <Zap className="w-5 h-5" />,
  "WiFi Ready": <Wifi className="w-5 h-5" />,
  "WiFi": <Wifi className="w-5 h-5" />,
  "Security": <Shield className="w-5 h-5" />,
  "Borehole Water": <Droplets className="w-5 h-5" />,
  "Borehole": <Droplets className="w-5 h-5" />,
  "Water Supply": <Droplets className="w-5 h-5" />,
  "Laundry Area": <WashingMachine className="w-5 h-5" />,
};

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<any>(null);
  const [ownerPhone, setOwnerPhone] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<BookingStatusType>("none");

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;
      const isUUID = id.length > 10;
      
      if (isUUID) {
        const { data } = await supabase
          .from("properties")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (data) {
          setListing({
            id: data.id,
            title: data.title,
            description: data.description,
            location: data.location,
            university: data.university,
            price: data.price,
            period: data.period,
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            size: data.size || "N/A",
            amenities: data.amenities || [],
            images: data.images && data.images.length > 0 ? data.images : ["/placeholder.svg"],
            videos: data.videos || [],
            isVerified: data.is_verified,
            isAvailable: data.is_available,
            ownerId: data.owner_id,
          });

          if (data.owner_id) {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("phone, full_name")
              .eq("id", data.owner_id)
              .maybeSingle();
            if (profileData) {
              setOwnerPhone(profileData.phone);
              setOwnerName(profileData.full_name);
            }
          }
          setLoading(false);
          return;
        }
      }

      const staticListing = getListingById(Number(id));
      setListing(staticListing);
      setLoading(false);
    };

    const fetchBookingStatus = async () => {
      if (!id) return;
      const { data: bookings } = await supabase
        .from("bookings")
        .select("inspection_status, payment_status")
        .eq("listing_id", String(id))
        .order("created_at", { ascending: false });

      if (bookings && bookings.length > 0) {
        const approvedBooking = bookings.find(
          (b) => b.inspection_status === "approved" && b.payment_status === "verified"
        );
        if (approvedBooking) { setBookingStatus("approved"); return; }

        const pendingBooking = bookings.find(
          (b) => 
            (b.inspection_status === "pending" || b.inspection_status === "scheduled" || b.inspection_status === "in_progress") &&
            (b.payment_status === "submitted" || b.payment_status === "pending")
        );
        if (pendingBooking) { setBookingStatus("pending"); return; }
      }
      setBookingStatus("none");
    };

    fetchListing();
    fetchBookingStatus();
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lodge-accent"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground mb-2">Listing not found</h1>
          <Button onClick={() => navigate("/")}>Go back home</Button>
        </div>
      </div>
    );
  }

  const galleryImages = listing.images.slice(0, 5);
  const serviceFee = Math.round(listing.price * 0.1);
  const lodgeMeFee = Math.round(listing.price * 0.025);
  const totalPrice = listing.price + serviceFee + lodgeMeFee;
  const displayedAmenities = showAllAmenities ? (listing.amenities || []) : (listing.amenities || []).slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Top Nav */}
      <header className="hidden md:flex items-center justify-between px-6 lg:px-10 py-4 border-b border-border">
        <div className="flex items-center gap-8">
          <h1
            className="text-xl font-bold text-lodge-accent cursor-pointer"
            onClick={() => navigate("/")}
          >
            LodgeMe
          </h1>
          <nav className="flex items-center gap-6 text-sm font-medium text-foreground">
            <button onClick={() => navigate("/explore")} className="hover:text-foreground/70 transition-colors">Explore</button>
            <button onClick={() => navigate("/wishlists")} className="hover:text-foreground/70 transition-colors">Saved</button>
            <button className="hover:text-foreground/70 transition-colors">LodgeMe Business</button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="text-sm font-medium text-foreground hover:text-foreground/70 transition-colors">
            List your lodge
          </button>
          <Globe className="w-5 h-5 text-foreground" />
          <div onClick={() => navigate("/profile")} className="flex items-center gap-2 border border-border rounded-full px-3 py-1.5 hover:shadow-md transition-shadow cursor-pointer">
            <Menu className="w-4 h-4 text-foreground" />
            <div className="w-7 h-7 rounded-full bg-foreground flex items-center justify-center">
              <User className="w-4 h-4 text-background" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Back Header */}
      <div className="md:hidden sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted">
            <Share className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? "fill-lodge-accent stroke-lodge-accent" : "text-foreground"}`} />
          </button>
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-4 md:px-6 lg:px-10">
        {/* Title Section - Desktop */}
        <div className="hidden md:block pt-6 pb-4">
          <h1 className="text-[26px] font-semibold text-foreground">{listing.title}</h1>
          <div className="flex items-center gap-1.5 mt-1 text-sm">
            <Star className="w-4 h-4 fill-foreground text-foreground" />
            <span className="font-semibold text-foreground">4.92</span>
            <span className="text-foreground">·</span>
            <button className="underline font-medium text-foreground">12 Reviews</button>
            <span className="text-foreground">·</span>
            <button className="underline font-medium text-foreground">{listing.location}</button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="md:rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[280px] md:h-[400px]">
            <div
              className="md:col-span-2 md:row-span-2 relative cursor-pointer group"
              onClick={() => setShowAllPhotos(true)}
            >
              <img
                src={galleryImages[0]}
                alt={listing.title}
                className="w-full h-full object-cover group-hover:brightness-95 transition-all"
              />
            </div>
            {galleryImages[1] && (
              <div className="hidden md:block relative cursor-pointer group" onClick={() => setShowAllPhotos(true)}>
                <img src={galleryImages[1]} alt="" className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
              </div>
            )}
            {galleryImages[2] && (
              <div className="hidden md:block relative cursor-pointer group" onClick={() => setShowAllPhotos(true)}>
                <img src={galleryImages[2]} alt="" className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
              </div>
            )}
            {galleryImages[3] && (
              <div className="hidden md:block relative cursor-pointer group" onClick={() => setShowAllPhotos(true)}>
                <img src={galleryImages[3]} alt="" className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
              </div>
            )}
            {galleryImages[4] ? (
              <div className="hidden md:block relative cursor-pointer group" onClick={() => setShowAllPhotos(true)}>
                <img src={galleryImages[4]} alt="" className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
                <button
                  className="absolute bottom-4 right-4 bg-background text-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-md border border-border hover:bg-muted transition-colors"
                  onClick={(e) => { e.stopPropagation(); setShowAllPhotos(true); }}
                >
                  <Grid3X3 className="w-4 h-4" />
                  Show all photos
                </button>
              </div>
            ) : (
              <div className="hidden md:flex relative cursor-pointer group bg-muted items-center justify-center" onClick={() => setShowAllPhotos(true)}>
                <button className="bg-background text-foreground px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-md border border-border">
                  <Grid3X3 className="w-4 h-4" />
                  Show all photos
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Full Photos Modal */}
        {showAllPhotos && (
          <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
            <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
              <button onClick={() => setShowAllPhotos(false)} className="flex items-center gap-2 text-foreground hover:underline">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </button>
              <span className="text-sm text-muted-foreground">
                {listing.images.length} photos{listing.videos?.length > 0 ? `, ${listing.videos.length} videos` : ''}
              </span>
            </div>
            <div className="p-4 space-y-4 max-w-4xl mx-auto">
              {listing.videos?.map((video: string, index: number) => (
                <div key={`video-${index}`} className="relative">
                  <video src={video} controls className="w-full rounded-lg" poster={listing.images[0]} />
                  <div className="absolute top-3 left-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <Play className="w-3 h-3" />
                    Video {index + 1}
                  </div>
                </div>
              ))}
              {listing.images.map((image: string, index: number) => (
                <img key={`image-${index}`} src={image} alt={`${listing.title} - ${index + 1}`} className="w-full rounded-lg" />
              ))}
            </div>
          </div>
        )}

        {/* Mobile Title */}
        <div className="md:hidden pt-4 pb-2">
          <h1 className="text-xl font-semibold text-foreground">{listing.title}</h1>
          <div className="flex items-center gap-1.5 mt-1 text-sm">
            <Star className="w-3.5 h-3.5 fill-foreground text-foreground" />
            <span className="font-semibold text-foreground">4.92</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">12 Reviews</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{listing.location}</span>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 pt-6 pb-24 md:pb-12">
          {/* Left Content */}
          <div className="flex-1 min-w-0">
            {/* Host Info */}
            <div className="flex items-center justify-between pb-6 border-b border-border">
              <div>
                <h2 className="text-[22px] font-medium text-foreground">
                  Room in a curated student lodge
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {ownerName ? `Designed by ${ownerName.split(' ')[0]}` : 'Managed by LodgeMe'} — {listing.isVerified ? 'Verified Host' : 'Host'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-background" />
              </div>
            </div>

            {/* Booking Status Banners */}
            {bookingStatus === "pending" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-amber-800 mb-1">Booking in Progress</h3>
                    <p className="text-sm text-amber-700">Someone has already booked this property and it's currently awaiting verification.</p>
                  </div>
                </div>
              </div>
            )}
            {bookingStatus === "approved" && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-red-800 mb-1">Property Already Booked</h3>
                    <p className="text-sm text-red-700">This property has been verified and is no longer available.</p>
                  </div>
                </div>
              </div>
            )}

            {/* About This Space */}
            <div className="py-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground mb-3">About this space</h3>
              <p className="text-[15px] text-foreground/80 leading-relaxed">{listing.description}</p>
            </div>

            {/* Premium Amenities */}
            {listing.amenities && listing.amenities.length > 0 && (
              <div className="py-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground mb-4">Premium Amenities</h3>
                <div className="grid grid-cols-2 gap-4">
                  {displayedAmenities.map((amenity: string, index: number) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-foreground/70">
                        {amenityIcons[amenity] || <Zap className="w-5 h-5" />}
                      </span>
                      <span className="text-[15px] text-foreground">{amenity}</span>
                    </div>
                  ))}
                </div>
                {listing.amenities.length > 6 && (
                  <button
                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                    className="mt-4 text-lodge-accent font-medium text-sm hover:underline"
                  >
                    {showAllAmenities ? 'Show less' : `Show all ${listing.amenities.length} amenities`}
                  </button>
                )}
              </div>
            )}

            {/* Payment Protection */}
            <div className="py-6 border-b border-border">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-6 h-6 text-lodge-accent flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">LodgeMe Payment Protection</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    All payments are secured through LodgeMe. We verify the property before releasing payment to protect you from scams.
                  </p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3 mt-6">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">
                <strong>Warning:</strong> Never send money directly to agents outside the LodgeMe platform.
              </p>
            </div>

            {/* Reviews Section */}
            <div className="py-8">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 fill-foreground text-foreground" />
                <span className="text-lg font-semibold text-foreground">4.92 · 12 Reviews</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-semibold text-foreground">CO</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">Chiamaka O.</p>
                      <p className="text-xs text-muted-foreground">Engineering Student · 2 months ago</p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    "The power stability is actual magic. I never have to worry about my laptop dying during midnight study sessions. Highly recommended!"
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-semibold text-foreground">DS</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">David S.</p>
                      <p className="text-xs text-muted-foreground">Law Student · 5 months ago</p>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    "Safe, clean, and extremely close to campus. The host is very responsive whenever I have questions."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Booking Card - Desktop */}
          <div className="hidden md:block w-[370px] flex-shrink-0">
            <div className="sticky top-8 border border-border rounded-xl shadow-lg p-6">
              {/* Price */}
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-[22px] font-semibold text-foreground">{formatCurrency(listing.price)}</span>
                <span className="text-muted-foreground">/ {listing.period}</span>
              </div>

              {/* Semester / Dates Selector */}
              <div className="border border-border rounded-xl overflow-hidden mb-4">
                <div className="px-3 py-2.5 border-b border-border">
                  <label className="text-[10px] font-bold text-foreground/70 uppercase tracking-wider">Academic Semester</label>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-foreground">Rain Semester 2024</span>
                    <ChevronDown className="w-4 h-4 text-foreground/50" />
                  </div>
                </div>
                <div className="grid grid-cols-2 divide-x divide-border">
                  <div className="px-3 py-2.5">
                    <label className="text-[10px] font-bold text-foreground/70 uppercase tracking-wider">Check-In</label>
                    <p className="text-sm text-foreground">Select date</p>
                  </div>
                  <div className="px-3 py-2.5">
                    <label className="text-[10px] font-bold text-foreground/70 uppercase tracking-wider">Check-Out</label>
                    <p className="text-sm text-foreground">Select date</p>
                  </div>
                </div>
              </div>

              {/* Book Now Button */}
              {bookingStatus === "none" ? (
                <button
                  onClick={() => navigate(`/booking/${id}`)}
                  className="w-full py-3 rounded-lg bg-lodge-accent text-lodge-accent-foreground font-semibold text-base hover:opacity-90 transition-opacity"
                >
                  Book Now
                </button>
              ) : bookingStatus === "pending" ? (
                <button disabled className="w-full py-3 rounded-lg bg-amber-500 text-white font-semibold text-base flex items-center justify-center gap-2 opacity-80">
                  <Clock className="w-4 h-4" />
                  Awaiting Verification
                </button>
              ) : (
                <button disabled className="w-full py-3 rounded-lg bg-muted text-muted-foreground font-semibold text-base flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Already Booked
                </button>
              )}

              <p className="text-center text-sm text-muted-foreground mt-3">You won't be charged yet</p>

              {/* Price Breakdown */}
              <div className="mt-5 pt-5 border-t border-border space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/70 underline">Base Rent</span>
                  <span className="text-foreground">{formatCurrency(listing.price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/70 underline">Service Charge</span>
                  <span className="text-foreground">{formatCurrency(serviceFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-foreground/70 underline">LodgeMe Fee</span>
                  <span className="text-foreground">{formatCurrency(lodgeMeFee)}</span>
                </div>
                <div className="flex justify-between font-semibold text-foreground pt-3 border-t border-border">
                  <span>Total</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </div>

              {/* Payment Protection Badge */}
              <div className="flex items-center justify-center gap-2 mt-5 pt-4 border-t border-border">
                <ShieldCheck className="w-4 h-4 text-lodge-accent" />
                <span className="text-sm font-medium text-lodge-accent">LodgeMe Payment Protection</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3 z-20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(listing.price)}
              <span className="text-sm font-normal text-muted-foreground"> / {listing.period}</span>
            </p>
          </div>
          {bookingStatus === "none" ? (
            <button
              onClick={() => navigate(`/booking/${id}`)}
              className="px-6 py-2.5 rounded-lg bg-lodge-accent text-lodge-accent-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Book Now
            </button>
          ) : bookingStatus === "pending" ? (
            <button disabled className="px-6 py-2.5 rounded-lg bg-amber-500 text-white font-semibold text-sm flex items-center gap-2 opacity-80">
              <Clock className="w-4 h-4" />
              Awaiting
            </button>
          ) : (
            <button disabled className="px-6 py-2.5 rounded-lg bg-muted text-muted-foreground font-semibold text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Booked
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
