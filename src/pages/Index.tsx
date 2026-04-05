import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import ListingsHome from "@/components/ListingsHome";
import BottomNav from "@/components/BottomNav";
import FilterSheet, { FilterOptions } from "@/components/FilterSheet";
import { allListings, Listing } from "@/data/listings";
import { supabase } from "@/integrations/supabase/client";
import { BookingStatus } from "@/components/ListingCardAirbnb";

interface ExtendedListing extends Listing {
  bookingStatus?: BookingStatus;
  isSharedSpace?: boolean;
}

const DEFAULT_FILTERS: FilterOptions = {
  priceRange: [0, 600000],
  locations: [],
  propertyTypes: [],
  availableOnly: false,
};

const Index = () => {
  const navigate = useNavigate();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [searchQuery, setSearchQuery] = useState("");

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
        id: property.id, // Keep the UUID string id
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

  // Fetch active bookings to determine which properties are booked
  const { data: activeBookings = [] } = useQuery({
    queryKey: ["active-bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bookings")
        .select("listing_id, inspection_status, payment_status")
        .in("inspection_status", ["pending", "scheduled", "in_progress"])
        .in("payment_status", ["submitted", "pending"]);

      if (error) {
        console.error("Error fetching bookings:", error);
        return [];
      }

      return data;
    },
  });

  // Create a map of listing_id -> booking status
  const bookingStatusMap = useMemo(() => {
    const map: Record<string, BookingStatus> = {};
    activeBookings.forEach((booking) => {
      // If there's an active booking (pending inspection), mark as booked
      map[booking.listing_id] = "booked";
    });
    return map;
  }, [activeBookings]);

  // Fetch shared spaces
  const { data: sharedSpaces = [] } = useQuery({
    queryKey: ["shared-spaces"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shared_spaces")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching shared spaces:", error);
        return [];
      }

      return data.map((space): Listing => ({
        id: space.id,
        image: space.images?.[0] || "/placeholder.svg",
        images: space.images || [],
        title: `🤝 ${space.title}`,
        description: space.description,
        location: space.location,
        price: Number(space.price),
        period: space.period,
        isVerified: false,
        amenities: space.amenities || [],
        bedrooms: space.bedrooms,
        bathrooms: space.bathrooms,
        size: "",
      }));
    },
  });

  // Combine database properties, shared spaces, and static listings
  const allCombinedListings = useMemo(() => {
    const combinedListings: ExtendedListing[] = [
      ...dbProperties.map((listing) => ({
        ...listing,
        bookingStatus: bookingStatusMap[String(listing.id)] || "available",
      })),
      ...sharedSpaces.map((listing) => ({
        ...listing,
        bookingStatus: "available" as BookingStatus,
        isSharedSpace: true,
      })),
      ...allListings.map((listing) => ({
        ...listing,
        bookingStatus: bookingStatusMap[String(listing.id)] || "available",
      })),
    ];
    return combinedListings;
  }, [dbProperties, sharedSpaces, bookingStatusMap]);

  const filteredListings = useMemo(() => {
    return allCombinedListings.filter((listing) => {
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          listing.title.toLowerCase().includes(query) ||
          listing.location.toLowerCase().includes(query) ||
          listing.description?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

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
  }, [filters, allCombinedListings, searchQuery]);

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
        <SearchBar 
          onFilterClick={() => setFilterOpen(true)} 
          activeFilterCount={activeFilterCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Main Content */}
      <main>
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">
            {activeFilterCount > 0 ? `${filteredListings.length} listings` : "All listings"}
          </h1>
          <button
            onClick={() => navigate("/share-space")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lodge-accent text-lodge-accent-foreground text-xs font-semibold hover:bg-lodge-accent/90 transition-colors"
          >
            <Users className="w-3.5 h-3.5" />
            Share Space
          </button>
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
