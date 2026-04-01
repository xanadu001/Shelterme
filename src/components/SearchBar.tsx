import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import logo from "@/assets/logo.png";

interface SearchBarProps {
  onFilterClick: () => void;
  activeFilterCount?: number;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

const SearchBar = ({ 
  onFilterClick, 
  activeFilterCount = 0,
  searchQuery = "",
  onSearchChange
}: SearchBarProps) => {
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    onSearchChange?.(value);
  };

  return (
    <div className="px-4 py-3">
      {/* Platform Logo */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <img src={logo} alt="LodgeMe" className="h-8 w-auto" />
        <h1 className="text-xl font-bold text-primary">LodgeMe</h1>
      </div>
      
      {/* Search Bar */}
      <div className="w-full flex items-center gap-3 bg-background border border-border rounded-full px-4 py-2.5 shadow-sm">
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input
          type="text"
          value={localQuery}
          onChange={handleInputChange}
          placeholder="Search by location, title..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <button
          onClick={onFilterClick}
          className="relative w-8 h-8 border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0"
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
