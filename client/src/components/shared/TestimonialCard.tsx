import { Star, StarHalf } from "lucide-react";

interface TestimonialCardProps {
  content: string;
  author: string;
  rating: number;
}

export default function TestimonialCard({ content, author, rating }: TestimonialCardProps) {
  // Generate star rating
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="text-accent fill-accent" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="text-accent fill-accent" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-star-${i}`} className="text-neutral-medium" />);
    }

    return stars;
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6">
      <div className="flex items-center mb-4">
        <div className="text-accent flex">
          {renderStars()}
        </div>
      </div>
      <p className="text-neutral-dark mb-4">"{content}"</p>
      <div className="font-medium text-primary">{author}</div>
    </div>
  );
}
