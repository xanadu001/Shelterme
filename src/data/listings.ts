import listing1 from "@/assets/listing-1.jpg";
import listing2 from "@/assets/listing-2.jpg";
import listing3 from "@/assets/listing-3.jpg";
import listing4 from "@/assets/listing-4.jpg";
import listing5 from "@/assets/listing-5.jpg";
import listing6 from "@/assets/listing-6.jpg";

export interface Listing {
  id: number | string;
  image: string;
  images: string[];
  title: string;
  description: string;
  location: string;
  price: number;
  period: string;
  isVerified?: boolean;
  amenities: string[];
  bedrooms: number;
  bathrooms: number;
  size: string;
}

export const allListings: Listing[] = [
  {
    id: 1,
    image: listing1,
    images: [listing1, listing2, listing3],
    title: "Self-Contain near UNILAG Main Gate",
    description: "Spacious self-contain apartment with 24/7 power supply, clean water from borehole, and round-the-clock security. Perfect for students who value comfort and convenience. The apartment is well-ventilated with large windows and modern finishing. Located just 5 minutes walk from UNILAG main gate.",
    location: "Akoka, Lagos",
    price: 350000,
    period: "year",
    isVerified: true,
    amenities: ["24/7 Power", "Borehole Water", "Security", "Tiled Floor", "POP Ceiling", "Wardrobe"],
    bedrooms: 1,
    bathrooms: 1,
    size: "18 sqm",
  },
  {
    id: 2,
    image: listing2,
    images: [listing2, listing4, listing6],
    title: "Shared Room at Onike",
    description: "Clean and comfortable shared room for 2 students. The room is spacious with good ventilation and natural lighting. Close to campus shuttle pickup point. Shared kitchen and bathroom facilities are well-maintained. Great for budget-conscious students.",
    location: "Onike, Yaba",
    price: 120000,
    period: "year",
    isVerified: true,
    amenities: ["Shared Kitchen", "Security", "Water Supply", "Reading Table", "Fan"],
    bedrooms: 1,
    bathrooms: 1,
    size: "15 sqm",
  },
  {
    id: 3,
    image: listing3,
    images: [listing3, listing1, listing5],
    title: "Single Room Apartment",
    description: "Furnished single room with private kitchen and bathroom. The apartment comes with basic furniture including bed, reading table, and chair. Located in a quiet neighborhood ideal for studying. Regular water and power supply.",
    location: "Bariga, Lagos",
    price: 280000,
    period: "year",
    isVerified: false,
    amenities: ["Private Kitchen", "Private Bathroom", "Furnished", "Water Supply"],
    bedrooms: 1,
    bathrooms: 1,
    size: "20 sqm",
  },
  {
    id: 4,
    image: listing4,
    images: [listing4, listing2, listing6],
    title: "Hostel Space at Bodija",
    description: "Well-ventilated room in a secure hostel compound. The hostel has a serene environment conducive for reading. Facilities include common room with TV, laundry area, and 24-hour security. Walking distance to UI campus.",
    location: "Bodija, Ibadan",
    price: 85000,
    period: "year",
    isVerified: true,
    amenities: ["Security", "Common Room", "Laundry Area", "Water Supply", "Fan"],
    bedrooms: 1,
    bathrooms: 1,
    size: "12 sqm",
  },
  {
    id: 5,
    image: listing5,
    images: [listing5, listing3, listing1],
    title: "Self-Contain near UI Gate",
    description: "Modern self-contain with prepaid meter and borehole water. The apartment features quality tiles, modern bathroom fittings, and spacious living area. Located in a gated compound with security personnel. Very close to UI main gate.",
    location: "Agbowo, Ibadan",
    price: 180000,
    period: "year",
    isVerified: false,
    amenities: ["Prepaid Meter", "Borehole", "Security", "Tiles", "Wardrobe"],
    bedrooms: 1,
    bathrooms: 1,
    size: "22 sqm",
  },
  {
    id: 6,
    image: listing6,
    images: [listing6, listing4, listing2],
    title: "Flat Share for Students",
    description: "Shared 2-bedroom flat perfect for final year students or postgraduates. The flat is fully furnished with modern amenities. Each room is spacious with built-in wardrobes. Shared living room and kitchen. 24/7 power supply guaranteed.",
    location: "Samonda, Ibadan",
    price: 150000,
    period: "year",
    isVerified: true,
    amenities: ["24/7 Power", "Furnished", "Kitchen", "Living Room", "Wardrobe", "Security"],
    bedrooms: 2,
    bathrooms: 1,
    size: "45 sqm",
  },
  {
    id: 7,
    image: listing2,
    images: [listing2, listing1, listing3],
    title: "Off-Campus Apartment",
    description: "Fully furnished apartment with AC and stable electricity. Premium accommodation for students who want the best. Features include modern kitchen, quality bathroom fittings, and 24/7 power supply. Close to AUN campus with easy transportation.",
    location: "Near AUN Campus, Yola",
    price: 400000,
    period: "year",
    isVerified: true,
    amenities: ["AC", "24/7 Power", "Furnished", "Kitchen", "Security", "WiFi Ready"],
    bedrooms: 1,
    bathrooms: 1,
    size: "30 sqm",
  },
  {
    id: 8,
    image: listing4,
    images: [listing4, listing5, listing6],
    title: "Budget Single Room",
    description: "Affordable single room with shared facilities. Perfect for students on a tight budget. The room is clean and well-maintained with basic amenities. Shared bathroom and kitchen with other tenants. Secure compound with gate.",
    location: "Jimeta, Yola",
    price: 60000,
    period: "year",
    isVerified: false,
    amenities: ["Shared Kitchen", "Shared Bathroom", "Security", "Fan"],
    bedrooms: 1,
    bathrooms: 1,
    size: "10 sqm",
  },
  {
    id: 9,
    image: listing6,
    images: [listing6, listing1, listing3],
    title: "Studio Apartment",
    description: "Compact studio with kitchenette, ideal for postgrad students. The apartment is well-designed to maximize space. Features include built-in wardrobe, modern bathroom, and cooking area. Quiet neighborhood perfect for academic work.",
    location: "Near AUN, Yola",
    price: 250000,
    period: "year",
    isVerified: true,
    amenities: ["Kitchenette", "Wardrobe", "Security", "Water Supply", "Tiles"],
    bedrooms: 1,
    bathrooms: 1,
    size: "25 sqm",
  },
  {
    id: 10,
    image: listing1,
    images: [listing1, listing4, listing5],
    title: "Modern Self-Contain",
    description: "Brand new self-contain with modern finishing. Features include POP ceiling, quality tiles, and spacious rooms. The compound has 24/7 security and regular water supply. Very close to UNILAG campus.",
    location: "Akoka, Lagos",
    price: 420000,
    period: "year",
    isVerified: true,
    amenities: ["New Building", "POP Ceiling", "Tiles", "Security", "Water Supply", "Wardrobe"],
    bedrooms: 1,
    bathrooms: 1,
    size: "24 sqm",
  },
  {
    id: 11,
    image: listing3,
    images: [listing3, listing2, listing6],
    title: "Cozy Shared Room",
    description: "Comfortable shared room in a student-friendly environment. Well-ventilated with good natural lighting. Shared facilities are regularly cleaned. Close to bus stops and markets. Great community of students.",
    location: "Sango, Ibadan",
    price: 95000,
    period: "year",
    isVerified: false,
    amenities: ["Shared Facilities", "Security", "Water Supply", "Fan"],
    bedrooms: 1,
    bathrooms: 1,
    size: "14 sqm",
  },
  {
    id: 12,
    image: listing5,
    images: [listing5, listing4, listing1],
    title: "Spacious 2-Bedroom Flat",
    description: "Large 2-bedroom flat suitable for group of students. Fully furnished with all necessary amenities. Features include spacious living room, modern kitchen, and two bathrooms. 24/7 security and power supply.",
    location: "Bodija, Ibadan",
    price: 550000,
    period: "year",
    isVerified: true,
    amenities: ["2 Bedrooms", "2 Bathrooms", "Kitchen", "Living Room", "24/7 Power", "Security", "Furnished"],
    bedrooms: 2,
    bathrooms: 2,
    size: "65 sqm",
  },
];

export const getListingById = (id: number): Listing | undefined => {
  return allListings.find((listing) => listing.id === id);
};
