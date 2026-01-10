import SearchBar from "@/components/SearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import ListingsHome from "@/components/ListingsHome";
import BottomNav from "@/components/BottomNav";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Top Section */}
      <div className="sticky top-0 z-40 bg-background">
        <SearchBar />
        <CategoryTabs />
      </div>

      {/* Main Content */}
      <main>
        <ListingsHome />
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Index;
