import SearchBar from "@/components/SearchBar";
import ListingsHome from "@/components/ListingsHome";
import BottomNav from "@/components/BottomNav";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Section */}
      <div className="sticky top-0 z-40 bg-background">
        <SearchBar />
      </div>

      {/* Main Content */}
      <main>
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-xl font-semibold text-foreground">All listings</h1>
        </div>
        <ListingsHome />
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Index;
