import { Search, Heart, User } from "lucide-react";
import { useState } from "react";

const navItems = [
  { id: "explore", icon: Search, label: "Explore" },
  { id: "wishlists", icon: Heart, label: "Wishlists" },
  { id: "login", icon: User, label: "Log in" },
];

const BottomNav = () => {
  const [activeTab, setActiveTab] = useState("explore");

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="flex justify-around items-center py-2 max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 py-2 px-6 transition-colors ${
              activeTab === item.id ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <item.icon
              className={`w-6 h-6 ${
                activeTab === item.id ? "stroke-[2.5]" : "stroke-[1.5]"
              }`}
            />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
