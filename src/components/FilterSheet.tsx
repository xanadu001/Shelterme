import { useState } from "react";
import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface FilterOptions {
  priceRange: [number, number];
  locations: string[];
  propertyTypes: string[];
  availableOnly: boolean;
}

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterOptions;
  onApplyFilters: (filters: FilterOptions) => void;
}

const LOCATIONS = ["Lagos", "Ibadan", "Yola"];
const PROPERTY_TYPES = ["Self-Contain", "Shared Room", "Flat", "Hostel", "Studio"];

const FilterSheet = ({ open, onOpenChange, filters, onApplyFilters }: FilterSheetProps) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filters);

  const handlePriceChange = (value: number[]) => {
    setLocalFilters((prev) => ({ ...prev, priceRange: [value[0], value[1]] }));
  };

  const toggleLocation = (location: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      locations: prev.locations.includes(location)
        ? prev.locations.filter((l) => l !== location)
        : [...prev.locations, location],
    }));
  };

  const togglePropertyType = (type: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      propertyTypes: prev.propertyTypes.includes(type)
        ? prev.propertyTypes.filter((t) => t !== type)
        : [...prev.propertyTypes, type],
    }));
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onOpenChange(false);
  };

  const handleClear = () => {
    const clearedFilters: FilterOptions = {
      priceRange: [0, 600000],
      locations: [],
      propertyTypes: [],
      availableOnly: false,
    };
    setLocalFilters(clearedFilters);
    onApplyFilters(clearedFilters);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl">
        <SheetHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <button onClick={() => onOpenChange(false)} className="p-2 -ml-2">
            <X className="w-5 h-5" />
          </button>
          <SheetTitle className="text-center flex-1">Filters</SheetTitle>
          <button onClick={handleClear} className="text-sm text-primary font-medium">
            Clear all
          </button>
        </SheetHeader>

        <div className="py-6 space-y-8 overflow-y-auto max-h-[calc(85vh-140px)]">
          {/* Price Range */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Price Range (per year)</h3>
            <Slider
              value={[localFilters.priceRange[0], localFilters.priceRange[1]]}
              onValueChange={handlePriceChange}
              max={600000}
              min={0}
              step={10000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>₦{localFilters.priceRange[0].toLocaleString()}</span>
              <span>₦{localFilters.priceRange[1].toLocaleString()}</span>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Location</h3>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map((location) => (
                <button
                  key={location}
                  onClick={() => toggleLocation(location)}
                  className={`px-4 py-2 rounded-full border text-sm transition-colors ${
                    localFilters.locations.includes(location)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-foreground hover:border-primary"
                  }`}
                >
                  {location}
                </button>
              ))}
            </div>
          </div>

          {/* Property Type */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Property Type</h3>
            <div className="flex flex-wrap gap-2">
              {PROPERTY_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => togglePropertyType(type)}
                  className={`px-4 py-2 rounded-full border text-sm transition-colors ${
                    localFilters.propertyTypes.includes(type)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-foreground hover:border-primary"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Available Only */}
          <div className="flex items-center space-x-3">
            <Checkbox
              id="available"
              checked={localFilters.availableOnly}
              onCheckedChange={(checked) =>
                setLocalFilters((prev) => ({ ...prev, availableOnly: checked === true }))
              }
            />
            <Label htmlFor="available" className="text-sm font-medium">
              Show available listings only
            </Label>
          </div>
        </div>

        {/* Apply Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
          <Button onClick={handleApply} className="w-full" size="lg">
            Show results
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default FilterSheet;
