import { MapPin, Bed, Bath, Wifi, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ListingCardProps {
  image: string;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  isVerified: boolean;
  university?: string;
  availableFrom: string;
}

const ListingCard = ({
  image,
  title,
  location,
  price,
  bedrooms,
  bathrooms,
  amenities,
  isVerified,
  university,
  availableFrom,
}: ListingCardProps) => {
  return (
    <article className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/50">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {isVerified && (
          <div className="absolute top-3 left-3">
            <Badge variant="success" className="gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Verified
            </Badge>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-card/90 backdrop-blur-sm">
            Available {availableFrom}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Price and Title */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">${price}</span>
            <span className="text-muted-foreground text-sm">/month</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground line-clamp-1 group-hover:text-accent transition-colors">
            {title}
          </h3>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{location}</span>
        </div>

        {/* University Badge */}
        {university && (
          <div className="text-sm text-muted-foreground">
            Near <span className="font-medium text-foreground">{university}</span>
          </div>
        )}

        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4" />
            <span>{bedrooms} {bedrooms === 1 ? "Bed" : "Beds"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4" />
            <span>{bathrooms} {bathrooms === 1 ? "Bath" : "Baths"}</span>
          </div>
          {amenities.includes("WiFi") && (
            <div className="flex items-center gap-1.5">
              <Wifi className="w-4 h-4" />
              <span>WiFi</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <Button variant="outline" className="w-full mt-2">
          View Details
        </Button>
      </div>
    </article>
  );
};

export default ListingCard;
