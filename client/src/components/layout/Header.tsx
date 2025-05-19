import { useEffect, useState } from "react";
import { LogOut, User } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logoutUser } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState<string>("");

  useEffect(() => {
    // Fetch user info - in a real app, this would come from context or a query
    const fetchUserInfo = async () => {
      try {
        const response = await fetch("/api/auth/current-user", {
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsername(data.username || "User");
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    
    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast({
        title: "Logged out successfully",
      });
      navigate("/auth/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
      });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40 h-16">
      <div className="container mx-auto px-4 h-full flex justify-between items-center">
        <h1 className="font-heading text-xl font-bold text-primary">{title}</h1>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
