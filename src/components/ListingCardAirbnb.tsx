import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ListingCardAirbnbProps {
  id: number;
  image: string;
  title: string;
  location: string;
  price: number;
  period: string;
  isFavorite?: boolean;
  isVerified?: boolean;
}

const ListingCardAirbnb = ({
  id,
  image,
  title,
  location,
  price,
  period,
  isFavorite = false,
  isVerified = false,
}: ListingCardAirbnbProps) => {
  const navigate = useNavigate();

  return (
    <div className="cursor-pointer group" onClick={() => navigate(`/listing/${id}`)}>
      {/* Image Container */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Verified Badge */}
        {isVerified && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-full">
            <span className="text-xs font-medium">Verified</span>
          </div>
        )}
        
        {/* Heart Button */}
        <button 
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFavorite
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
