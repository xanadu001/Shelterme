import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ListingCardAirbnb from "@/components/ListingCardAirbnb";
import { allListings } from "@/data/listings";
import BottomNav from "@/components/BottomNav";

const WishlistPage = () => {
  const navigate = useNavigate();
  const [wishlistedListings, setWishlistedListings] = useState<typeof allListings>([]);

  useEffect(() => {
    const loadWishlist = () => {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const listings = allListings.filter((listing) => wishlist.includes(listing.id));
      setWishlistedListings(listings);
    };

    loadWishlist();

    // Listen for storage changes to update in real-time
    const handleStorageChange = () => loadWishlist();
    window.addEventListener("storage", handleStorageChange);
    
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-background z-40 border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => navigate("/")}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Wishlists</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {wishlistedListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">❤️</span>
            </div>
            <h2 className="text-lg font-semibold mb-2">No saved listings yet</h2>
            <p className="text-muted-foreground text-sm max-w-xs">
              Tap the heart icon on any listing to save it to your wishlist
            </p>
          </div>
        ) : (
          <>
            <p className="text-muted-foreground text-sm mb-4">
              {wishlistedListings.length} saved {wishlistedListings.length === 1 ? "listing" : "listings"}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
              {wishlistedListings.map((listing) => (
                <ListingCardAirbnb
                  key={listing.id}
                  id={listing.id}
                  image={listing.image}
                  title={listing.title}
                  location={listing.location}
                  price={listing.price}
                  period={listing.period}
                  isAvailable={listing.isVerified}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default WishlistPage;
