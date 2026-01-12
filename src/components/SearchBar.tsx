import { Search, SlidersHorizontal } from "lucide-react";

const SearchBar = () => {
  return (
    <div className="px-4 py-2">
      <button className="w-full flex items-center gap-3 bg-background border border-border rounded-full px-4 py-2.5 shadow-sm hover:shadow-md transition-shadow">
        <Search className="w-4 h-4 text-muted-foreground" />
        <span className="flex-1 text-left text-muted-foreground text-sm">
          Self-contain, shared room, flat...
        </span>
        <div className="w-8 h-8 border border-border rounded-full flex items-center justify-center">
          <SlidersHorizontal className="w-4 h-4 text-foreground" />
        </div>
      </button>
    </div>
  );
};

export default SearchBar;
