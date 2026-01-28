import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share, MapPin, Bed, Bath, Maximize, Check, MessageCircle, Phone, Grid3X3 } from "lucide-react";
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
  is_verified: boolean | null;
  is_available: boolean | null;
}

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<any>(null);
  const [ownerPhone, setOwnerPhone] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;

      // First try to get from database (UUID format)
      const isUUID = id.length > 10;
      
      if (isUUID) {
        const { data, error } = await supabase
          .from("properties")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (data) {
          // Transform database property to listing format
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
            isVerified: data.is_verified,
            isAvailable: data.is_available,
            ownerId: data.owner_id,
          });

          // Fetch owner's profile for phone number
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

      // Fallback to static data for numeric IDs
      const staticListing = getListingById(Number(id));
      setListing(staticListing);
      setLoading(false);
    };

    fetchListing();
  }, [id]);

  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove spaces, dashes, and other characters
    let cleaned = phone.replace(/[\s\-\(\)]/g, '');
    // If it starts with 0, replace with 234 (Nigeria code)
    if (cleaned.startsWith('0')) {
      cleaned = '234' + cleaned.slice(1);
    }
    // If it doesn't start with +, assume it needs the country code
    if (!cleaned.startsWith('+') && !cleaned.startsWith('234')) {
      cleaned = '234' + cleaned;
    }
    // Remove the + if present
    cleaned = cleaned.replace('+', '');
    return cleaned;
  };

  const handleCall = () => {
    if (ownerPhone) {
      window.location.href = `tel:${ownerPhone}`;
    }
  };

  const handleMessage = () => {
    if (ownerPhone) {
      const formattedPhone = formatPhoneForWhatsApp(ownerPhone);
      const message = encodeURIComponent(`Hello, I'm interested in your property "${listing?.title}" listed on ShelterMe. Is it still available?`);
      window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

  // Get up to 5 images for the gallery
  const galleryImages = listing.images.slice(0, 5);
  const hasMorePhotos = listing.images.length > 5;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with Title and Actions */}
      <div className="px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="text-xl md:text-2xl font-semibold text-foreground line-clamp-2">
              {listing.title}
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-muted transition-colors">
              <Share className="w-4 h-4 text-foreground" />
              <span className="text-sm font-medium text-foreground underline hidden sm:inline">Share</span>
            </button>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite ? "fill-primary stroke-primary" : "text-foreground"
                }`}
              />
              <span className="text-sm font-medium text-foreground underline hidden sm:inline">Save</span>
            </button>
          </div>
        </div>
      </div>

      {/* Airbnb-style Image Gallery */}
      <div className="px-4">
        <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-xl overflow-hidden h-[280px] md:h-[400px]">
          {/* Main large image - takes 2 columns and full height */}
          <div 
            className="col-span-2 row-span-2 relative cursor-pointer group"
            onClick={() => setShowAllPhotos(true)}
          >
            <img
              src={galleryImages[0]}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:brightness-90 transition-all"
            />
            {listing.isVerified && (
              <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2.5 py-1 rounded-full">
                <span className="text-xs font-medium">Verified</span>
              </div>
            )}
          </div>

          {/* Top right images */}
          {galleryImages[1] && (
            <div 
              className="relative cursor-pointer group"
              onClick={() => setShowAllPhotos(true)}
            >
              <img
                src={galleryImages[1]}
                alt={`${listing.title} - 2`}
                className="w-full h-full object-cover group-hover:brightness-90 transition-all"
              />
            </div>
          )}
          {galleryImages[2] && (
            <div 
              className="relative cursor-pointer group"
              onClick={() => setShowAllPhotos(true)}
            >
              <img
                src={galleryImages[2]}
                alt={`${listing.title} - 3`}
                className="w-full h-full object-cover group-hover:brightness-90 transition-all"
              />
            </div>
          )}

          {/* Bottom right images */}
          {galleryImages[3] && (
            <div 
              className="relative cursor-pointer group"
              onClick={() => setShowAllPhotos(true)}
            >
              <img
                src={galleryImages[3]}
                alt={`${listing.title} - 4`}
                className="w-full h-full object-cover group-hover:brightness-90 transition-all"
              />
            </div>
          )}
          {galleryImages[4] ? (
            <div 
              className="relative cursor-pointer group"
              onClick={() => setShowAllPhotos(true)}
            >
              <img
                src={galleryImages[4]}
                alt={`${listing.title} - 5`}
                className="w-full h-full object-cover group-hover:brightness-90 transition-all"
              />
              {/* Show all photos button */}
              <button 
                className="absolute bottom-3 right-3 bg-background text-foreground px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-md hover:bg-muted transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllPhotos(true);
                }}
              >
                <Grid3X3 className="w-4 h-4" />
                Show all photos
              </button>
            </div>
          ) : galleryImages[3] ? (
            <div 
              className="relative cursor-pointer group bg-muted flex items-center justify-center"
              onClick={() => setShowAllPhotos(true)}
            >
              <button 
                className="bg-background text-foreground px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-md"
              >
                <Grid3X3 className="w-4 h-4" />
                Show all
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Full Photos Modal */}
      {showAllPhotos && (
        <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
          <div className="sticky top-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setShowAllPhotos(false)}
              className="flex items-center gap-2 text-foreground hover:underline"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <span className="text-sm text-muted-foreground">{listing.images.length} photos</span>
          </div>
          <div className="p-4 space-y-2 max-w-4xl mx-auto">
            {listing.images.map((image: string, index: number) => (
              <img
                key={index}
                src={image}
                alt={`${listing.title} - ${index + 1}`}
                className="w-full rounded-lg"
              />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 pt-4 space-y-6">
        {/* Title & Location */}
        <div>
          <h1 className="text-xl font-semibold text-foreground mb-1">
            {listing.title}
          </h1>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{listing.location}</span>
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex gap-6 py-4 border-y border-border">
          <div className="flex items-center gap-2">
            <Bed className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-foreground">
              {listing.bedrooms} {listing.bedrooms === 1 ? "Bedroom" : "Bedrooms"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-foreground">
              {listing.bathrooms} {listing.bathrooms === 1 ? "Bathroom" : "Bathrooms"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Maximize className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-foreground">{listing.size}</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">About this place</h2>
          <p className="text-muted-foreground leading-relaxed">{listing.description}</p>
        </div>

        {/* Amenities */}
        {listing.amenities && listing.amenities.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3">What this place offers</h2>
            <div className="grid grid-cols-2 gap-3">
              {listing.amenities.map((amenity: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div className="bg-muted/50 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            {ownerName ? `Contact ${ownerName.split(' ')[0]}` : 'Contact Agent'}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {ownerPhone 
              ? "Interested in this property? Reach out to the agent for more information or to schedule a viewing."
              : "Contact our support team for more information about this property."
            }
          </p>
          <div className="flex gap-3">
            <Button 
              className="flex-1 gap-2" 
              variant="outline"
              onClick={handleCall}
              disabled={!ownerPhone}
            >
              <Phone className="w-4 h-4" />
              Call
            </Button>
            <Button 
              className="flex-1 gap-2"
              onClick={handleMessage}
              disabled={!ownerPhone}
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </Button>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-foreground">
              ₦{listing.price.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground">/{listing.period}</span>
            </p>
          </div>
          <Button size="lg" onClick={() => navigate(`/booking/${id}`)}>Book Now</Button>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
