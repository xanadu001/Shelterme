import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share, MapPin, Bed, Bath, Maximize, Check, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getListingById } from "@/data/listings";
import { useState } from "react";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const listing = getListingById(Number(id));

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

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Image Gallery */}
      <div className="relative">
        <div className="aspect-[16/9] overflow-hidden">
          <img
            src={listing.images[currentImageIndex]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-9 h-9 bg-background rounded-full flex items-center justify-center shadow-md"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>

        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className="w-9 h-9 bg-background rounded-full flex items-center justify-center shadow-md"
          >
            <Heart
              className={`w-5 h-5 ${
                isFavorite ? "fill-primary stroke-primary" : "text-foreground"
              }`}
            />
          </button>
          <button className="w-9 h-9 bg-background rounded-full flex items-center justify-center shadow-md">
            <Share className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Image Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {listing.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentImageIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>

        {/* Verified Badge */}
        {listing.isVerified && (
          <div className="absolute bottom-4 left-4 bg-primary text-primary-foreground px-3 py-1.5 rounded-full">
            <span className="text-sm font-medium">Verified</span>
          </div>
        )}
      </div>

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
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">What this place offers</h2>
          <div className="grid grid-cols-2 gap-3">
            {listing.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="w-3 h-3 text-primary" />
                </div>
                <span className="text-sm text-foreground">{amenity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-muted/50 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-foreground mb-2">Contact Us</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Interested in this property? Reach out to our team for more information or to schedule a viewing.
          </p>
          <div className="flex gap-3">
            <Button className="flex-1 gap-2" variant="outline">
              <Phone className="w-4 h-4" />
              Call
            </Button>
            <Button className="flex-1 gap-2">
              <MessageCircle className="w-4 h-4" />
              Message
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
