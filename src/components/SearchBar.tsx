import { Search, SlidersHorizontal } from "lucide-react";

interface SearchBarProps {
  onFilterClick: () => void;
  activeFilterCount?: number;
}

const SearchBar = ({ onFilterClick, activeFilterCount = 0 }: SearchBarProps) => {
  return (
    <div className="px-4 py-2">
      <div className="w-full flex items-center gap-3 bg-background border border-border rounded-full px-4 py-2.5 shadow-sm">
        <Search className="w-4 h-4 text-muted-foreground" />
        <span className="flex-1 text-left text-muted-foreground text-sm">
          Self-contain, shared room, flat...
        </span>
        <button
          onClick={onFilterClick}
          className="relative w-8 h-8 border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4 text-foreground" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-medium rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
