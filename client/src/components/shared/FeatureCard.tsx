import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Calendar, Heart, Book } from "lucide-react";

interface FeatureCardProps {
  imageSrc: string;
  title: string;
  description: string;
  buttonText: string;
  buttonIcon: string;
  buttonColor: string;
  onClick: () => void;
}

export default function FeatureCard({
  imageSrc,
  title,
  description,
  buttonText,
  buttonIcon,
  buttonColor,
  onClick,
}: FeatureCardProps) {
  // Helper function to render the appropriate icon
  const renderIcon = (): ReactNode => {
    switch (buttonIcon) {
      case "camera":
        return <Camera className="mr-2 h-4 w-4" />;
      case "calendar":
        return <Calendar className="mr-2 h-4 w-4" />;
      case "heart":
        return <Heart className="mr-2 h-4 w-4" />;
      case "book":
        return <Book className="mr-2 h-4 w-4" />;
      default:
        return null;
    }
  };

  // Determine button class based on buttonColor
  const getButtonClass = (): string => {
    switch (buttonColor) {
      case "primary":
        return "bg-primary hover:bg-primary-dark text-white";
      case "secondary":
        return "bg-secondary hover:bg-secondary-dark text-white";
      case "accent":
        return "bg-accent hover:bg-accent-dark text-white";
      case "primary-light":
        return "bg-primary-light hover:bg-primary text-white";
      default:
        return "bg-primary hover:bg-primary-dark text-white";
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-soft p-6 flex flex-col items-center text-center">
      <img 
        src={imageSrc} 
        alt={title} 
        className="w-full h-48 object-cover rounded-2xl mb-5"
      />
      <h3 className="font-heading font-bold text-xl text-primary mb-3">{title}</h3>
      <p className="text-neutral-dark mb-5">{description}</p>
      <Button 
        className={`mt-auto px-6 py-3 ${getButtonClass()} font-medium rounded-full transition duration-200`}
        onClick={onClick}
      >
        {renderIcon()}
        {buttonText}
      </Button>
    </div>
  );
}
