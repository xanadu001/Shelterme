import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import SearchBar from "@/components/SearchBar";
import ListingsHome from "@/components/ListingsHome";
import BottomNav from "@/components/BottomNav";
import FilterSheet, { FilterOptions } from "@/components/FilterSheet";
import { allListings, Listing } from "@/data/listings";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_FILTERS: FilterOptions = {
  priceRange: [0, 600000],
  locations: [],
  propertyTypes: [],
  availableOnly: false,
};

const Index = () => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);

  // Fetch properties from database
  const { data: dbProperties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching properties:", error);
        return [];
      }

      // Transform database properties to match Listing interface
      return data.map((property): Listing => ({
        id: property.id as unknown as number, // Use string id but cast for compatibility
        image: property.images?.[0] || "/placeholder.svg",
        images: property.images || [],
        title: property.title,
        description: property.description,
        location: property.location,
        price: Number(property.price),
        period: property.period,
        isVerified: property.is_verified || false,
        amenities: property.amenities || [],
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        size: property.size || "",
      }));
    },
  });

  // Combine database properties with static listings (db properties first)
  const allCombinedListings = useMemo(() => {
    return [...dbProperties, ...allListings];
  }, [dbProperties]);

  const filteredListings = useMemo(() => {
    return allCombinedListings.filter((listing) => {
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
  }, [filters, allCombinedListings]);

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
