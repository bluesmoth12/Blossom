import { useState } from "react";
import { PlayCircle, Heart, Download, Pause, Play } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";

interface Meditation {
  id: number;
  title: string;
  duration: number;
  level: string;
  image: string;
  audioUrl: string;
  description: string;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  count: number;
  color: string;
}

interface RecentMeditation {
  id: number;
  title: string;
  duration: number;
  lastPlayed: string;
  color: string;
}

export default function MeditationPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Fetch featured meditation
  const { data: featuredMeditation, isLoading: isLoadingFeatured } = useQuery({
    queryKey: ['/api/meditations/featured'],
  });

  // Fetch categories
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['/api/meditations/categories'],
  });

  // Fetch recently played
  const { data: recentlyPlayed = [], isLoading: isLoadingRecent } = useQuery({
    queryKey: ['/api/meditations/recent'],
  });

  const handlePlayPause = (audioUrl: string) => {
    try {
      // In a demo environment, we may not have actual audio files
      // So we'll simulate playback
      if (currentAudio) {
        currentAudio.pause();
      }
      
      // For demo purposes, create a simulated audio experience
      // This way we avoid errors from missing files
      const demoAudioHandler = {
        demoTimer: null as NodeJS.Timeout | null,
        src: audioUrl,
        play: function() {
          // Notify user of demo mode
          toast({
            title: "Meditation started",
            description: "In this prototype, meditation audio is simulated. Enjoy your virtual meditation!",
          });
          
          // Simulate an 8-second meditation
          this.demoTimer = setTimeout(() => {
            setIsPlaying(false);
            toast({
              title: "Meditation complete",
              description: "Your meditation session has ended. Take a moment to reflect on how you feel.",
            });
          }, 8000);
          
          return Promise.resolve();
        },
        pause: function() {
          if (this.demoTimer) {
            clearTimeout(this.demoTimer);
            this.demoTimer = null;
          }
        },
        onended: null as (() => void) | null
      };
      
      // Set event handler
      demoAudioHandler.onended = () => {
        setIsPlaying(false);
      };
      
      // Store our demo audio handler
      setCurrentAudio(demoAudioHandler as unknown as HTMLAudioElement);
      
      // Handle play/pause states
      if (isPlaying) {
        demoAudioHandler.pause();
        setIsPlaying(false);
      } else {
        demoAudioHandler.play();
        setIsPlaying(true);
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Playback error",
        description: "Could not play meditation audio. Please try again.",
      });
      console.error("Audio playback error:", err);
    }
  };

  const downloadMeditation = (audioUrl: string, title: string) => {
    // In a demo environment, we'll simulate the download
    toast({
      title: "Demo Mode",
      description: "In this prototype, downloads are simulated. In a production app, the audio would be downloaded.",
    });
    
    // Simulate a short delay to represent download in progress
    setTimeout(() => {
      toast({
        title: "Download complete",
        description: `'${title}' would be saved to your device in the full version.`,
      });
    }, 1500);
  };

  const addToFavorites = (meditationId: number) => {
    toast({
      title: "Added to favorites",
      description: "Meditation added to your favorites.",
    });
  };

  // Mock data for the UI (this would come from the API in production)
  const mockFeaturedMeditation: Meditation = {
    id: 1,
    title: "Stress Relief for Clearer Skin",
    duration: 8,
    level: "Beginner friendly",
    image: "https://images.unsplash.com/photo-1520206183501-b80df61043c2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
    audioUrl: "https://example.com/meditation1.mp3",
    description: "This meditation helps reduce stress hormones that can trigger skin problems. Practice regularly for best results."
  };

  const mockCategories: Category[] = [
    {
      id: 1,
      name: "Stress Relief",
      icon: "mental-health",
      count: 6,
      color: "primary"
    },
    {
      id: 2,
      name: "Self-Acceptance",
      icon: "emotion-happy",
      count: 8,
      color: "secondary"
    },
    {
      id: 3,
      name: "Better Sleep",
      icon: "sleep",
      count: 5,
      color: "accent"
    },
    {
      id: 4,
      name: "Focus & Clarity",
      icon: "focus",
      count: 4,
      color: "primary-light"
    }
  ];

  const mockRecentMeditations: RecentMeditation[] = [
    {
      id: 1,
      title: "Morning Skin Positivity",
      duration: 5,
      lastPlayed: "2d ago",
      color: "primary"
    },
    {
      id: 2,
      title: "Bedtime Relaxation",
      duration: 10,
      lastPlayed: "5d ago",
      color: "accent"
    }
  ];

  return (
    <div className="pt-20 pb-24 px-4">
      <Header title="Guided Meditation" />
      
      <div className="container mx-auto max-w-4xl">
        {/* Featured Meditation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-primary">Recommended For You</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl overflow-hidden relative mb-4">
              <img 
                src={mockFeaturedMeditation.image} 
                alt="Calm meditation scene" 
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-4">
                <div className="text-white font-bold text-xl mb-1">{mockFeaturedMeditation.title}</div>
                <div className="text-white/80 text-sm">{mockFeaturedMeditation.duration} minutes • {mockFeaturedMeditation.level}</div>
              </div>
              <button 
                className="absolute inset-0 m-auto w-16 h-16 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center"
                onClick={() => handlePlayPause(mockFeaturedMeditation.audioUrl)}
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8 text-white" />
                ) : (
                  <Play className="h-8 w-8 text-white ml-1" />
                )}
              </button>
            </div>
            
            <p className="text-neutral-dark mb-4">{mockFeaturedMeditation.description}</p>
            
            <div className="flex space-x-4">
              <Button 
                className="flex-1 py-2 px-4 bg-accent hover:bg-accent-dark text-white font-medium rounded-full"
                onClick={() => handlePlayPause(mockFeaturedMeditation.audioUrl)}
              >
                {isPlaying ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Play Now
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                className="py-2 px-4 border border-primary text-primary hover:bg-primary hover:text-white rounded-full"
                onClick={() => downloadMeditation(mockFeaturedMeditation.audioUrl, mockFeaturedMeditation.title)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline"
                className="py-2 px-4 border border-primary text-primary hover:bg-primary hover:text-white rounded-full"
                onClick={() => addToFavorites(mockFeaturedMeditation.id)}
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Meditation Categories */}
        <div className="mb-8">
          <h2 className="font-heading text-xl font-bold text-primary mb-4">Categories</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {mockCategories.map(category => (
              <Card key={category.id} className="p-4 flex items-center">
                <div className={`w-12 h-12 rounded-full bg-${category.color}/20 flex items-center justify-center mr-3`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`text-xl text-${category.color}`} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {category.icon === "mental-health" && (
                      <path d="M12 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0Zm7 1.5a7 7 0 1 0-12 4.9v1.1h2v1h2v1h2v-1h2v-1h2v-1.1a7 7 0 0 0 2-4.9Z" />
                    )}
                    {category.icon === "emotion-happy" && (
                      <>
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                        <line x1="9" y1="9" x2="9.01" y2="9" />
                        <line x1="15" y1="9" x2="15.01" y2="9" />
                      </>
                    )}
                    {category.icon === "sleep" && (
                      <>
                        <path d="M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
                        <path d="M12 19V5" />
                        <path d="M5 12h14" />
                      </>
                    )}
                    {category.icon === "focus" && (
                      <>
                        <circle cx="12" cy="12" r="10" />
                        <circle cx="12" cy="12" r="4" />
                        <line x1="12" y1="2" x2="12" y2="4" />
                        <line x1="12" y1="20" x2="12" y2="22" />
                        <line x1="2" y1="12" x2="4" y2="12" />
                        <line x1="20" y1="12" x2="22" y2="12" />
                      </>
                    )}
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-primary">{category.name}</div>
                  <div className="text-xs text-neutral-dark">{category.count} meditations</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Recently Played */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-primary">Recently Played</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentMeditations.map(meditation => (
                <div key={meditation.id} className="flex items-center p-3 bg-neutral-lightest rounded-xl">
                  <div className={`w-10 h-10 rounded-full bg-${meditation.color}/20 flex items-center justify-center mr-3`}>
                    <PlayCircle className={`text-lg text-${meditation.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-primary">{meditation.title}</div>
                    <div className="text-xs text-neutral-dark">{meditation.duration} minutes</div>
                  </div>
                  <div className="text-xs text-neutral-dark">{meditation.lastPlayed}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
