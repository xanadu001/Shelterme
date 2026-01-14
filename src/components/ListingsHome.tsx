import ListingCardAirbnb from "./ListingCardAirbnb";
import { allListings } from "@/data/listings";

const ListingsHome = () => {
  return (
    <div className="px-4 pb-24 pt-2">
      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
        {allListings.map((listing) => (
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
    </div>
  );
};

export default ListingsHome;
