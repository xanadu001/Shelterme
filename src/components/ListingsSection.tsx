import ListingCard from "./ListingCard";
import ListingFilters from "./ListingFilters";

import listing1 from "@/assets/listing-1.jpg";
import listing2 from "@/assets/listing-2.jpg";
import listing3 from "@/assets/listing-3.jpg";
import listing4 from "@/assets/listing-4.jpg";
import listing5 from "@/assets/listing-5.jpg";
import listing6 from "@/assets/listing-6.jpg";

const listings = [
  {
    id: 1,
    image: listing1,
    title: "Modern Studio Near Campus",
    location: "123 University Ave, Boston, MA",
    price: 850,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["WiFi", "Laundry", "Gym"],
    isVerified: true,
    university: "Boston University",
    availableFrom: "Sep 1",
  },
  {
    id: 2,
    image: listing2,
    title: "Spacious 2BR with City Views",
    location: "456 College St, Cambridge, MA",
    price: 1200,
    bedrooms: 2,
    bathrooms: 1,
    amenities: ["WiFi", "Parking", "Balcony"],
    isVerified: true,
    university: "MIT",
    availableFrom: "Aug 15",
  },
  {
    id: 3,
    image: listing3,
    title: "Cozy Studio with Kitchen",
    location: "789 Student Lane, Somerville, MA",
    price: 650,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["WiFi", "Utilities Included"],
    isVerified: true,
    university: "Tufts University",
    availableFrom: "Sep 1",
  },
  {
    id: 4,
    image: listing4,
    title: "Shared Room - Great Value",
    location: "321 Campus Drive, Boston, MA",
    price: 450,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["WiFi", "Study Room", "Lounge"],
    isVerified: true,
    university: "Northeastern University",
    availableFrom: "Aug 25",
  },
  {
    id: 5,
    image: listing5,
    title: "Premium Penthouse Suite",
    location: "100 Harbor View, Boston, MA",
    price: 1800,
    bedrooms: 2,
    bathrooms: 2,
    amenities: ["WiFi", "Gym", "Rooftop", "Concierge"],
    isVerified: true,
    university: "Boston College",
    availableFrom: "Sep 1",
  },
  {
    id: 6,
    image: listing6,
    title: "Affordable Single Room",
    location: "555 Budget Blvd, Brookline, MA",
    price: 550,
    bedrooms: 1,
    bathrooms: 1,
    amenities: ["WiFi", "Shared Kitchen"],
    isVerified: true,
    university: "Boston University",
    availableFrom: "Sep 1",
  },
];

const ListingsSection = () => {
  return (
    <section id="listings" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Featured Verified Listings
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our hand-picked selection of verified student accommodations. Every listing is checked for quality and safety.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <ListingFilters />
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing, index) => (
            <div
              key={listing.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ListingCard {...listing} />
            </div>
          ))}
        </div>

        {/* View More */}
        <div className="text-center mt-12">
          <button className="text-accent hover:text-accent/80 font-semibold transition-colors">
            View All Listings →
          </button>
        </div>
      </div>
    </section>
  );
};

export default ListingsSection;
