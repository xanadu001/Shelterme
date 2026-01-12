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
  location: string;
  price: number;
  period: string;
  isVerified?: boolean;
}

const allListings: Listing[] = [
  {
    id: 1,
    image: listing1,
    title: "Self-Contain near UNILAG Main Gate",
    location: "Akoka, Lagos",
    price: 350000,
    period: "year",
    isVerified: true,
  },
  {
    id: 2,
    image: listing2,
    title: "Shared Room at Onike",
    location: "Onike, Yaba",
    price: 120000,
    period: "year",
    isVerified: true,
  },
  {
    id: 3,
    image: listing3,
    title: "Single Room Apartment",
    location: "Bariga, Lagos",
    price: 280000,
    period: "year",
    isVerified: false,
  },
  {
    id: 4,
    image: listing4,
    title: "Hostel Space at Bodija",
    location: "Bodija, Ibadan",
    price: 85000,
    period: "year",
    isVerified: true,
  },
  {
    id: 5,
    image: listing5,
    title: "Self-Contain near UI Gate",
    location: "Agbowo, Ibadan",
    price: 180000,
    period: "year",
    isVerified: false,
  },
  {
    id: 6,
    image: listing6,
    title: "Flat Share for Students",
    location: "Samonda, Ibadan",
    price: 150000,
    period: "year",
    isVerified: true,
  },
  {
    id: 7,
    image: listing2,
    title: "Off-Campus Apartment",
    location: "Near AUN Campus, Yola",
    price: 400000,
    period: "year",
    isVerified: true,
  },
  {
    id: 8,
    image: listing4,
    title: "Budget Single Room",
    location: "Jimeta, Yola",
    price: 60000,
    period: "year",
    isVerified: false,
  },
  {
    id: 9,
    image: listing6,
    title: "Studio Apartment",
    location: "Near AUN, Yola",
    price: 250000,
    period: "year",
    isVerified: true,
  },
  {
    id: 10,
    image: listing1,
    title: "Modern Self-Contain",
    location: "Akoka, Lagos",
    price: 420000,
    period: "year",
    isVerified: true,
  },
  {
    id: 11,
    image: listing3,
    title: "Cozy Shared Room",
    location: "Sango, Ibadan",
    price: 95000,
    period: "year",
    isVerified: false,
  },
  {
    id: 12,
    image: listing5,
    title: "Spacious 2-Bedroom Flat",
    location: "Bodija, Ibadan",
    price: 550000,
    period: "year",
    isVerified: true,
  },
];

const ListingsHome = () => {
  return (
    <div className="px-4 pb-24 pt-2">
      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
        {allListings.map((listing) => (
          <ListingCardAirbnb
            key={listing.id}
            image={listing.image}
            title={listing.title}
            location={listing.location}
            price={listing.price}
            period={listing.period}
            isVerified={listing.isVerified}
          />
        ))}
      </div>
    </div>
  );
};

export default ListingsHome;
