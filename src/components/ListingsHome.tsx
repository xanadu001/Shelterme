import { ChevronRight } from "lucide-react";
import ListingCardAirbnb from "./ListingCardAirbnb";

import listing1 from "@/assets/listing-1.jpg";
import listing2 from "@/assets/listing-2.jpg";
import listing3 from "@/assets/listing-3.jpg";
import listing4 from "@/assets/listing-4.jpg";
import listing5 from "@/assets/listing-5.jpg";
import listing6 from "@/assets/listing-6.jpg";

interface ListingSectionProps {
  title: string;
  listings: Array<{
    id: number;
    image: string;
    title: string;
    price: number;
    nights: number;
    rating: number;
    isGuestFavorite?: boolean;
  }>;
}

const ListingSection = ({ title, listings }: ListingSectionProps) => {
  return (
    <section className="py-6">
      {/* Section Header */}
      <div className="px-4 mb-4">
        <button className="flex items-center gap-1 group">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <ChevronRight className="w-5 h-5 text-foreground group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex gap-4 px-4 pb-2">
          {listings.map((listing) => (
            <ListingCardAirbnb
              key={listing.id}
              image={listing.image}
              title={listing.title}
              price={listing.price}
              nights={listing.nights}
              rating={listing.rating}
              isGuestFavorite={listing.isGuestFavorite}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const popularListings = [
  {
    id: 1,
    image: listing1,
    title: "Studio Near Boston University",
    price: 245,
    nights: 2,
    rating: 4.93,
    isGuestFavorite: true,
  },
  {
    id: 2,
    image: listing2,
    title: "Apartment in Cambridge",
    price: 283,
    nights: 2,
    rating: 4.99,
    isGuestFavorite: true,
  },
  {
    id: 3,
    image: listing3,
    title: "Cozy Room in Somerville",
    price: 156,
    nights: 2,
    rating: 4.87,
    isGuestFavorite: false,
  },
];

const availableListings = [
  {
    id: 4,
    image: listing4,
    title: "Room Near Northeastern",
    price: 89,
    nights: 1,
    rating: 4.92,
    isGuestFavorite: true,
  },
  {
    id: 5,
    image: listing5,
    title: "Apartment in Back Bay",
    price: 312,
    nights: 2,
    rating: 4.95,
    isGuestFavorite: false,
  },
  {
    id: 6,
    image: listing6,
    title: "Budget Room in Brookline",
    price: 67,
    nights: 1,
    rating: 4.78,
    isGuestFavorite: true,
  },
];

const ListingsHome = () => {
  return (
    <div className="pb-24">
      <ListingSection title="Popular homes in Boston" listings={popularListings} />
      <ListingSection title="Available this weekend" listings={availableListings} />
      <ListingSection title="Top rated near you" listings={[...popularListings].reverse()} />
    </div>
  );
};

export default ListingsHome;
