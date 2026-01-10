import { Heart, Star } from "lucide-react";

interface ListingCardAirbnbProps {
  image: string;
  title: string;
  price: number;
  nights: number;
  rating: number;
  isFavorite?: boolean;
  isGuestFavorite?: boolean;
}

const ListingCardAirbnb = ({
  image,
  title,
  price,
  nights,
  rating,
  isFavorite = false,
  isGuestFavorite = false,
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
        
        {/* Guest Favorite Badge */}
        {isGuestFavorite && (
          <div className="absolute top-3 left-3 bg-background/95 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="text-sm font-medium text-foreground">Guest favorite</span>
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
        <h3 className="font-semibold text-foreground line-clamp-2 leading-tight">
          {title}
        </h3>
        <div className="flex items-center gap-1">
          <span className="text-foreground">${price} for {nights} nights</span>
          <span className="text-muted-foreground">·</span>
          <Star className="w-4 h-4 fill-foreground" />
          <span className="text-foreground">{rating.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default ListingCardAirbnb;
