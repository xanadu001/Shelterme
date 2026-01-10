import { Heart, MapPin } from "lucide-react";

interface ListingCardAirbnbProps {
  image: string;
  title: string;
  description: string;
  location: string;
  price: number;
  period: string;
  isFavorite?: boolean;
  isVerified?: boolean;
}

const ListingCardAirbnb = ({
  image,
  title,
  description,
  location,
  price,
  period,
  isFavorite = false,
  isVerified = false,
}: ListingCardAirbnbProps) => {
  return (
    <div className="flex-shrink-0 w-[280px] cursor-pointer group">
      {/* Image Container */}
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-3">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Verified Badge */}
        {isVerified && (
          <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1.5 rounded-full">
            <span className="text-sm font-medium">Verified</span>
          </div>
        )}
        
        {/* Heart Button */}
        <button className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center">
          <Heart
            className={`w-6 h-6 transition-colors ${
              isFavorite
                ? "fill-primary stroke-primary"
                : "fill-black/50 stroke-white stroke-2 hover:fill-black/30"
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-1">
        <h3 className="font-semibold text-foreground line-clamp-1 leading-tight">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <MapPin className="w-3.5 h-3.5" />
          <span className="line-clamp-1">{location}</span>
        </div>
        <p className="text-foreground font-semibold">
          ₦{price.toLocaleString()}<span className="font-normal text-muted-foreground">/{period}</span>
        </p>
      </div>
    </div>
  );
};

export default ListingCardAirbnb;
