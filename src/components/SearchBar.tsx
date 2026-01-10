import { Search, GraduationCap } from "lucide-react";

const SearchBar = () => {
  return (
    <div className="px-4 py-3">
      <button className="w-full flex items-center gap-4 bg-background border border-border rounded-full px-6 py-4 shadow-md hover:shadow-lg transition-shadow">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <span className="text-foreground font-medium block">Search by university</span>
          <span className="text-muted-foreground text-sm">Find housing near your campus</span>
        </div>
        <Search className="w-5 h-5 text-muted-foreground" />
      </button>
    </div>
  );
};

export default SearchBar;
