import { Search } from "lucide-react";

const SearchBar = () => {
  return (
    <div className="px-4 py-3">
      <button className="w-full flex items-center gap-4 bg-background border border-border rounded-full px-6 py-4 shadow-md hover:shadow-lg transition-shadow">
        <Search className="w-5 h-5 text-foreground" />
        <div className="flex-1 text-left">
          <span className="text-foreground font-medium">Start your search</span>
        </div>
      </button>
    </div>
  );
};

export default SearchBar;
