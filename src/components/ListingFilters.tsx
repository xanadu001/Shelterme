import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const priceRanges = [
  { label: "Under $500", value: "0-500" },
  { label: "$500 - $800", value: "500-800" },
  { label: "$800 - $1200", value: "800-1200" },
  { label: "$1200+", value: "1200-9999" },
];

const roomTypes = [
  { label: "Studio", value: "studio" },
  { label: "1 Bedroom", value: "1bed" },
  { label: "2+ Bedrooms", value: "2bed" },
  { label: "Shared Room", value: "shared" },
];

const ListingFilters = () => {
  const [activePrice, setActivePrice] = useState<string | null>(null);
  const [activeRoomType, setActiveRoomType] = useState<string | null>(null);

  return (
    <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50">
      <div className="flex flex-col lg:flex-row lg:items-center gap-6">
        {/* Filter Icon and Title */}
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <SlidersHorizontal className="w-5 h-5" />
          <span>Filters</span>
        </div>

        {/* Price Range */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">Price:</span>
          {priceRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setActivePrice(activePrice === range.value ? null : range.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                activePrice === range.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Room Type */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground mr-2">Type:</span>
          {roomTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setActiveRoomType(activeRoomType === type.value ? null : type.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                activeRoomType === type.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Clear Filters */}
        {(activePrice || activeRoomType) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setActivePrice(null);
              setActiveRoomType(null);
            }}
            className="ml-auto"
          >
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
};

export default ListingFilters;
