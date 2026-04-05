import ListingCardAirbnb, { BookingStatus } from "./ListingCardAirbnb";
import { Listing } from "@/data/listings";

interface ExtendedListing extends Listing {
  bookingStatus?: BookingStatus;
  isSharedSpace?: boolean;
}

interface ListingsHomeProps {
  listings: ExtendedListing[];
}

const ListingsHome = ({ listings = [] }: ListingsHomeProps) => {
  if (!listings || listings.length === 0) {
    return (
      <div className="px-4 pb-24 pt-2">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🏠</span>
          </div>
          <h2 className="text-lg font-semibold mb-2">No listings found</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Try adjusting your filters to see more results
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pb-24 pt-2">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-x-4 gap-y-6">
        {listings.map((listing) => (
          <ListingCardAirbnb
            key={listing.id}
            id={listing.id}
            image={listing.image}
            title={listing.title}
            location={listing.location}
            price={listing.price}
            period={listing.period}
            isAvailable={listing.isVerified}
            bookingStatus={listing.bookingStatus}
            isSharedSpace={listing.isSharedSpace}
          />
        ))}
      </div>
    </div>
  );
};

export default ListingsHome;
