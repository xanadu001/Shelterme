import { ChevronRight } from "lucide-react";
import ListingCardAirbnb from "./ListingCardAirbnb";

import listing1 from "@/assets/listing-1.jpg";
import listing2 from "@/assets/listing-2.jpg";
import listing3 from "@/assets/listing-3.jpg";
import listing4 from "@/assets/listing-4.jpg";
import listing5 from "@/assets/listing-5.jpg";
import listing6 from "@/assets/listing-6.jpg";

interface Listing {
  id: number;
  image: string;
  title: string;
  description: string;
  location: string;
  price: number;
  period: string;
  isVerified?: boolean;
}

interface ListingSectionProps {
  title: string;
  listings: Listing[];
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
              description={listing.description}
              location={listing.location}
              price={listing.price}
              period={listing.period}
              isVerified={listing.isVerified}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const uilagosListings: Listing[] = [
  {
    id: 1,
    image: listing1,
    title: "Self-Contain near UNILAG Main Gate",
    description: "Spacious self-contain with 24/7 power supply, water, and security",
    location: "Akoka, Lagos",
    price: 350000,
    period: "year",
    isVerified: true,
  },
  {
    id: 2,
    image: listing2,
    title: "Shared Room at Onike",
    description: "Clean shared room for 2 students, close to campus shuttle",
    location: "Onike, Yaba",
    price: 120000,
    period: "year",
    isVerified: true,
  },
  {
    id: 3,
    image: listing3,
    title: "Single Room Apartment",
    description: "Furnished single room with kitchen and bathroom",
    location: "Bariga, Lagos",
    price: 280000,
    period: "year",
    isVerified: false,
  },
];

const uiListings: Listing[] = [
  {
    id: 4,
    image: listing4,
    title: "Hostel Space at Bodija",
    description: "Well-ventilated room in a secure hostel compound",
    location: "Bodija, Ibadan",
    price: 85000,
    period: "year",
    isVerified: true,
  },
  {
    id: 5,
    image: listing5,
    title: "Self-Contain near UI Gate",
    description: "Modern self-contain with prepaid meter and borehole water",
    location: "Agbowo, Ibadan",
    price: 180000,
    period: "year",
    isVerified: false,
  },
  {
    id: 6,
    image: listing6,
    title: "Flat Share for Students",
    description: "Shared 2-bedroom flat, perfect for final year students",
    location: "Samonda, Ibadan",
    price: 150000,
    period: "year",
    isVerified: true,
  },
];

const aunListings: Listing[] = [
  {
    id: 7,
    image: listing2,
    title: "Off-Campus Apartment",
    description: "Fully furnished apartment with AC and stable electricity",
    location: "Near AUN Campus, Yola",
    price: 400000,
    period: "year",
    isVerified: true,
  },
  {
    id: 8,
    image: listing4,
    title: "Budget Single Room",
    description: "Affordable single room with shared facilities",
    location: "Jimeta, Yola",
    price: 60000,
    period: "year",
    isVerified: false,
  },
  {
    id: 9,
    image: listing6,
    title: "Studio Apartment",
    description: "Compact studio with kitchenette, ideal for postgrad students",
    location: "Near AUN, Yola",
    price: 250000,
    period: "year",
    isVerified: true,
  },
];

const ListingsHome = () => {
  return (
    <div className="pb-24">
      <ListingSection title="Near University of Lagos" listings={uilagosListings} />
      <ListingSection title="Near University of Ibadan" listings={uiListings} />
      <ListingSection title="Near American University of Nigeria" listings={aunListings} />
    </div>
  );
};

export default ListingsHome;
