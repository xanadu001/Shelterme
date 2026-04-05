import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export type BookingStatus = "available" | "booked" | "unavailable";

interface ListingCardAirbnbProps {
  id: number | string;
  image: string;
  title: string;
  location: string;
  price: number;
  period: string;
  isFavorite?: boolean;
  isAvailable?: boolean;
  bookingStatus?: BookingStatus;
  isSharedSpace?: boolean;
}

const ListingCardAirbnb = ({
  id,
  image,
  title,
  location,
  price,
  period,
  isFavorite = false,
  isAvailable = false,
  bookingStatus = "available",
}: ListingCardAirbnbProps) => {
  const navigate = useNavigate();
  const [isWishlisted, setIsWishlisted] = useState(isFavorite);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setIsWishlisted(wishlist.map(String).includes(String(id)));
  }, [id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const idStr = String(id);
    
    if (isWishlisted) {
      const updated = wishlist.filter((itemId: string | number) => String(itemId) !== idStr);
      localStorage.setItem("wishlist", JSON.stringify(updated));
      setIsWishlisted(false);
    } else {
      wishlist.push(idStr);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      setIsWishlisted(true);
    }
  };

  const getBadgeContent = () => {
    if (bookingStatus === "booked") {
      return { text: "Booked", className: "bg-amber-500 text-white" };
    }
    if (bookingStatus === "unavailable") {
      return { text: "Unavailable", className: "bg-muted text-muted-foreground" };
    }
    if (isAvailable) {
      return { text: "Available", className: "bg-primary text-primary-foreground" };
    }
    return null;
  };

  const badge = getBadgeContent();

  return (
    <div className="cursor-pointer group" onClick={() => navigate(`/listing/${id}`)}>
      {/* Image Container */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-muted">
        {/* Skeleton placeholder */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}
        <img
          src={image}
          alt={title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
        
        {/* Status Badge */}
        {badge && (
          <div className={`absolute top-2 left-2 px-2 py-1 rounded-full ${badge.className}`}>
            <span className="text-xs font-medium">{badge.text}</span>
          </div>
        )}
        
        {/* Heart Button */}
        <button 
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center"
          onClick={toggleWishlist}
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isWishlisted
                ? "fill-primary stroke-primary"
                : "fill-black/40 stroke-white stroke-2 hover:fill-black/20"
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-foreground text-sm line-clamp-1">
            {title}
          </h3>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-1">{location}</p>
        <p className="text-foreground text-sm">
          <span className="font-semibold">₦{price.toLocaleString()}</span>
          <span className="text-muted-foreground">/{period}</span>
        </p>
      </div>
    </div>
  );
};

export default ListingCardAirbnb;
