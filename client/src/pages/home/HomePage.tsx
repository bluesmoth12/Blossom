import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, BarChart2, TrendingUp, Calendar, Clock } from "lucide-react";
import FeatureCard from "@/components/shared/FeatureCard";
import TestimonialCard from "@/components/shared/TestimonialCard";
import Header from "@/components/layout/Header";

export default function HomePage() {
  const [, navigate] = useLocation();

  // Fetch skincare consistency for stats
  const { data: consistency = { completedDays: 0, weeklyGoal: 0, streak: 0 }, isLoading: isLoadingConsistency } = useQuery({
    queryKey: ['/api/skincare-consistency'],
  });

  // Fetch meditation history for stats
  const { data: recentMeditations = [], isLoading: isLoadingMeditations } = useQuery({
    queryKey: ['/api/meditations/recent'],
  });

  // Fetch journal entries for stats
  const { data: journalEntries = [], isLoading: isLoadingJournal } = useQuery({
    queryKey: ['/api/journal-entries'],
  });

  // Fetch skin analysis history for stats
  const { data: skinAnalysisHistory = [], isLoading: isLoadingSkinAnalysis } = useQuery({
    queryKey: ['/api/skin-analysis-history'],
  });

  return (
    <div className="pb-24">
      <Header title="Blossom" />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pb-12 pt-24 md:pt-32">
        {/* Hero Background */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary-light/20 to-neutral-lightest"></div>
        
        <div className="container mx-auto px-4">
          <div className="relative z-10">
            <div className="text-center mb-12">
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary mb-4">Your Skin Journey Starts Here</h1>
              <p className="text-lg md:text-xl max-w-2xl mx-auto text-neutral-dark">Blossom helps teens track skin health, build confidence, and nurture well-being all in one place.</p>
            </div>
            
            {/* Stats Dashboard Section */}
            <div className="mb-12">
              <Card className="mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-bold text-primary flex items-center">
                    <BarChart2 className="mr-2 h-5 w-5" />
                    Your Progress Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Skincare Routine Consistency */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-primary-light/20 rounded-xl p-4">
                        <div className="text-neutral-dark text-sm mb-1">Routine Streak</div>
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-primary mr-2" />
                          <div className="text-2xl font-bold text-primary">{consistency?.streak || 0}</div>
                          <div className="text-sm text-neutral-dark ml-1">days</div>
                        </div>
                      </div>
                      
                      <div className="bg-secondary-light/20 rounded-xl p-4">
                        <div className="text-neutral-dark text-sm mb-1">Weekly Goal</div>
                        <div className="flex items-center">
                          <TrendingUp className="h-5 w-5 text-secondary mr-2" />
                          <div className="text-2xl font-bold text-secondary">{consistency?.weeklyGoal || 0}</div>
                          <div className="text-sm text-neutral-dark ml-1">%</div>
                        </div>
                      </div>
                      
                      <div className="bg-accent-light/20 rounded-xl p-4">
                        <div className="text-neutral-dark text-sm mb-1">Meditations</div>
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 text-accent mr-2" />
                          <div className="text-2xl font-bold text-accent">{recentMeditations?.length || 0}</div>
                          <div className="text-sm text-neutral-dark ml-1">sessions</div>
                        </div>
                      </div>
                      
                      <div className="bg-primary-light/20 rounded-xl p-4">
                        <div className="text-neutral-dark text-sm mb-1">Journal Entries</div>
                        <div className="flex items-center">
                          <Calendar className="h-5 w-5 text-primary mr-2" />
                          <div className="text-2xl font-bold text-primary">{journalEntries?.length || 0}</div>
                          <div className="text-sm text-neutral-dark ml-1">entries</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-neutral-dark mb-2">Skin Analysis History</h3>
                      <div className="relative">
                        <div className="overflow-x-auto hide-scrollbar">
                          <div className="inline-flex space-x-2 pb-2 w-max">
                            {skinAnalysisHistory?.length > 0 ? (
                              skinAnalysisHistory.map((analysis: any, index: number) => (
                                <div key={index} className="w-16 h-16 rounded-lg overflow-hidden border border-neutral-light relative">
                                  <img 
                                    src={analysis.image} 
                                    alt={`Analysis ${index + 1}`} 
                                    className="w-full h-full object-cover" 
                                  />
                                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 py-1 px-2 text-white text-[10px] truncate">
                                    {new Date(analysis.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="w-full py-2 text-sm text-neutral-dark text-center">
                                No skin analyses yet
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="link" 
                      className="text-primary hover:text-primary-dark p-0 text-sm float-right"
                      onClick={() => navigate("/profile")}
                    >
                      View full stats <ChevronRight className="h-4 w-4 inline-block" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* AI Skin Analysis Feature */}
              <FeatureCard
                imageSrc="https://pixabay.com/get/g05130e40b6311d3ea43354334197bd00aac1a4c47acc2e8a649035d703a13e3f31eaf70a85dc826f3873118a8ef6160954486400f48e97357aa83eb294880f46_1280.jpg"
                title="AI Skin Analysis"
                description="Upload a selfie and receive personalized insights about your skin's health and progress."
                buttonText="Try Skin Analysis"
                buttonIcon="camera"
                buttonColor="primary"
                onClick={() => navigate("/skin-analysis")}
              />
              
              {/* Skincare Tracker Feature */}
              <FeatureCard
                imageSrc="https://pixabay.com/get/g69b596ae5c1636723f7727606f5bbf91b397eb1431689d5673631ca4db3ab2dd284893a0e8b3a6f0837c43c3784e08bb92cf3a417051cd3963b34742afffd14a_1280.jpg"
                title="Daily Skincare Tracker"
                description="Log your skincare routine and track what works for your unique skin journey."
                buttonText="Track Skincare"
                buttonIcon="calendar"
                buttonColor="secondary"
                onClick={() => navigate("/skincare-tracker")}
              />
              
              {/* Meditation Feature */}
              <FeatureCard
                imageSrc="https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"
                title="Guided Meditation"
                description="Short guided meditations specially designed to reduce stress and improve skin health."
                buttonText="Start Meditating"
                buttonIcon="heart"
                buttonColor="accent"
                onClick={() => navigate("/meditation")}
              />
              
              {/* Journaling Feature */}
              <FeatureCard
                imageSrc="https://images.unsplash.com/photo-1517842645767-c639042777db?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300"
                title="Private Journal"
                description="Write about your skin journey and feelings in a safe, private space just for you."
                buttonText="Open Journal"
                buttonIcon="book"
                buttonColor="primary-light"
                onClick={() => navigate("/journal")}
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-neutral-lightest">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold text-center text-primary mb-12">What Our Community Says</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TestimonialCard
              content="Blossom helped me understand my acne patterns. The tracking feature showed me which products were actually working for my skin!"
              author="Alex, 16"
              rating={5}
            />
            
            <TestimonialCard
              content="The meditations helped me manage stress, which was a big trigger for my breakouts. My skin is clearer and I feel more confident."
              author="Jamie, 17"
              rating={5}
            />
            
            <TestimonialCard
              content="Journaling on Blossom let me express my feelings about my skin. I realized I wasn't alone, and that helped me so much."
              author="Taylor, 15"
              rating={5}
            />
          </div>
        </div>
      </section>
      
      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <h2 className="font-heading text-3xl font-bold text-primary mb-6">Why We Created Blossom</h2>
              <p className="text-neutral-dark mb-6">We understand that skin concerns during teenage years can affect more than just your appearance—they impact your confidence and wellbeing too. That's why Blossom combines practical skin tracking with emotional support tools.</p>
              <p className="text-neutral-dark mb-6">Our app was developed with dermatologists and teen mental health experts to create a holistic approach to skin health.</p>
              <div className="flex space-x-4">
                <Button className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-full transition duration-200">
                  Learn More
                </Button>
                <Button variant="outline" className="px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-white font-medium rounded-full transition duration-200">
                  Our Team
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400" 
                alt="Diverse group of teens" 
                className="w-full h-auto rounded-2xl shadow-medium" 
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
