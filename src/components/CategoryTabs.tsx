import { useState } from "react";

const categories = [
  { id: "all", label: "All Listings" },
  { id: "self-contain", label: "Self-Contain" },
  { id: "shared", label: "Shared Rooms" },
  { id: "flats", label: "Flats" },
];

const CategoryTabs = () => {
  const [activeTab, setActiveTab] = useState("homes");

  return (
    <div className="border-b border-border">
      <div className="flex justify-center gap-8 px-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id)}
            className={`py-4 text-base font-medium transition-colors relative ${
              activeTab === category.id
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {category.label}
            {activeTab === category.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
