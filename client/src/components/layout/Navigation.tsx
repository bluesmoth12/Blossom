import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Home, Camera, Calendar, Heart, Book, User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const [location, navigate] = useLocation();
  const [activeRoute, setActiveRoute] = useState("/");

  useEffect(() => {
    setActiveRoute(location);
  }, [location]);

  const navItems = [
    { path: "/", label: "Home", icon: <Home className="text-xl" /> },
    { path: "/skin-analysis", label: "Analysis", icon: <Camera className="text-xl" /> },
    { path: "/skincare-tracker", label: "Tracker", icon: <Calendar className="text-xl" /> },
    { path: "/meditation", label: "Meditate", icon: <Heart className="text-xl" /> },
    { path: "/journal", label: "Journal", icon: <Book className="text-xl" /> },
    { path: "/profile", label: "Profile", icon: <User className="text-xl" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-40 rounded-t-2xl">
      <div className="flex justify-around items-center p-3">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            className={`flex flex-col items-center py-2 px-3 ${
              activeRoute === item.path ? "text-primary" : "text-neutral-dark hover:text-primary"
            } transition duration-200`}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
}
