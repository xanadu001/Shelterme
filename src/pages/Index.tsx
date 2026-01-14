import { useState, useMemo } from "react";
import SearchBar from "@/components/SearchBar";
import ListingsHome from "@/components/ListingsHome";
import BottomNav from "@/components/BottomNav";
import FilterSheet, { FilterOptions } from "@/components/FilterSheet";
import { allListings } from "@/data/listings";

const DEFAULT_FILTERS: FilterOptions = {
  priceRange: [0, 600000],
  locations: [],
  propertyTypes: [],
  availableOnly: false,
};

const Index = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);

  const filteredListings = useMemo(() => {
    return allListings.filter((listing) => {
      // Price filter
      if (listing.price < filters.priceRange[0] || listing.price > filters.priceRange[1]) {
        return false;
      }

      // Location filter
      if (filters.locations.length > 0) {
        const matchesLocation = filters.locations.some((loc) =>
          listing.location.toLowerCase().includes(loc.toLowerCase())
        );
        if (!matchesLocation) return false;
      }

      // Property type filter
      if (filters.propertyTypes.length > 0) {
        const matchesType = filters.propertyTypes.some((type) =>
          listing.title.toLowerCase().includes(type.toLowerCase())
        );
        if (!matchesType) return false;
      }

      // Available only filter
      if (filters.availableOnly && !listing.isVerified) {
        return false;
      }

      return true;
    });
  }, [filters]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 600000) count++;
    if (filters.locations.length > 0) count++;
    if (filters.propertyTypes.length > 0) count++;
    if (filters.availableOnly) count++;
    return count;
  }, [filters]);

  return (
    <div className="min-h-screen bg-background">
      {/* Top Section */}
      <div className="sticky top-0 z-40 bg-background">
        <SearchBar onFilterClick={() => setFilterOpen(true)} activeFilterCount={activeFilterCount} />
      </div>

      {/* Main Content */}
      <main>
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">
            {activeFilterCount > 0 ? `${filteredListings.length} listings` : "All listings"}
          </h1>
        </div>
        <ListingsHome listings={filteredListings} />
      </main>

      {/* Filter Sheet */}
      <FilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        onApplyFilters={setFilters}
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Index;
