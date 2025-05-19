import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Mail, Calendar, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { logoutUser } from "@/lib/auth";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";

export default function ProfilePage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [userData, setUserData] = useState<any>(null);

  // Fetch user data
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['/api/auth/current-user'],
  });

  // Fetch skincare consistency
  const { data: consistency, isLoading: isLoadingConsistency } = useQuery({
    queryKey: ['/api/skincare-consistency'],
  });

  // Fetch meditation stats
  const { data: recentMeditations, isLoading: isLoadingMeditations } = useQuery({
    queryKey: ['/api/meditations/recent'],
  });

  // Fetch journal entries count
  const { data: journalEntries, isLoading: isLoadingJournal } = useQuery({
    queryKey: ['/api/journal-entries'],
  });

  // Fetch skin analysis history
  const { data: skinAnalysisHistory, isLoading: isLoadingSkinAnalysis } = useQuery({
    queryKey: ['/api/skin-analysis-history'],
  });

  useEffect(() => {
    if (currentUser) {
      setUserData(currentUser);
    }
  }, [currentUser]);

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
    <div className="pt-20 pb-24 px-4">
      <Header title="My Profile" />
      
      <div className="container mx-auto max-w-4xl">
        {/* User Profile Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              <div className="w-24 h-24 rounded-full bg-primary-light text-primary flex items-center justify-center mb-4 md:mb-0 md:mr-6">
                <User className="w-12 h-12" />
              </div>
              
              <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-bold text-primary">
                  {isLoadingUser ? "Loading..." : userData?.firstName 
                    ? `${userData.firstName} ${userData.lastName || ''}`
                    : userData?.username.split('@')[0]
                  }
                </h2>
                
                <div className="flex flex-col md:flex-row items-center md:items-start mt-2 text-neutral-dark">
                  <div className="flex items-center mr-6 mb-2 md:mb-0">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{userData?.username || "Loading..."}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Joined May 2025</span>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button 
                    variant="outline" 
                    className="border border-primary text-primary hover:bg-primary hover:text-white font-medium"
                    onClick={() => {
                      // Navigate to a future edit profile page
                      toast({
                        title: "Coming soon",
                        description: "Edit profile functionality will be available soon!",
                      });
                    }}
                  >
                    Edit Profile
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="ml-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Activity Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-primary">Your Activity Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Skincare Routine Consistency */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-primary">Skincare Routine Consistency</h3>
                  <span className="text-sm text-neutral-dark">
                    {isLoadingConsistency ? "Loading..." : 
                      `${consistency?.completedDays || 0}/${consistency?.lastSevenDays?.length || 7} days`
                    }
                  </span>
                </div>
                <Progress 
                  value={isLoadingConsistency ? 0 : consistency?.weeklyGoal || 0} 
                  className="h-2"
                />
                <div className="mt-1 flex justify-between text-xs text-neutral-dark">
                  <span>Current streak: {isLoadingConsistency ? "..." : consistency?.streak || 0} days</span>
                  <span>Weekly goal: {isLoadingConsistency ? "..." : consistency?.weeklyGoal || 0}%</span>
                </div>
              </div>
              
              {/* Meditation Sessions */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-primary">Meditation Sessions</h3>
                  <span className="text-sm text-neutral-dark">
                    {isLoadingMeditations ? "Loading..." : `${recentMeditations?.length || 0} sessions`}
                  </span>
                </div>
                <Progress 
                  value={isLoadingMeditations ? 0 : Math.min((recentMeditations?.length || 0) * 20, 100)} 
                  className="h-2"
                />
                <div className="mt-1 text-xs text-neutral-dark">
                  <span>Goal: 5 sessions per week</span>
                </div>
              </div>
              
              {/* Journal Entries */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-primary">Journal Entries</h3>
                  <span className="text-sm text-neutral-dark">
                    {isLoadingJournal ? "Loading..." : `${journalEntries?.length || 0} entries`}
                  </span>
                </div>
                <Progress 
                  value={isLoadingJournal ? 0 : Math.min((journalEntries?.length || 0) * 33, 100)} 
                  className="h-2"
                />
                <div className="mt-1 text-xs text-neutral-dark">
                  <span>Goal: 3 entries per week</span>
                </div>
              </div>
              
              {/* Skin Analysis */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-primary">Skin Analysis</h3>
                  <span className="text-sm text-neutral-dark">
                    {isLoadingSkinAnalysis ? "Loading..." : `${skinAnalysisHistory?.length || 0} analyses`}
                  </span>
                </div>
                <Progress 
                  value={isLoadingSkinAnalysis ? 0 : Math.min((skinAnalysisHistory?.length || 0) * 50, 100)} 
                  className="h-2"
                />
                <div className="mt-1 text-xs text-neutral-dark">
                  <span>Goal: 2 analyses per week</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-primary">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-neutral-lightest mx-auto flex items-center justify-center mb-2">
                  <Calendar className="w-8 h-8 text-neutral-medium" />
                </div>
                <div className="text-sm font-medium text-neutral-dark">First Week</div>
                <div className="text-xs text-neutral-medium">Complete 1 week</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-neutral-lightest mx-auto flex items-center justify-center mb-2 opacity-50">
                  <Calendar className="w-8 h-8 text-neutral-medium" />
                </div>
                <div className="text-sm font-medium text-neutral-dark">Consistency</div>
                <div className="text-xs text-neutral-medium">5 day streak</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-neutral-lightest mx-auto flex items-center justify-center mb-2 opacity-50">
                  <User className="w-8 h-8 text-neutral-medium" />
                </div>
                <div className="text-sm font-medium text-neutral-dark">Self-care</div>
                <div className="text-xs text-neutral-medium">3 meditations</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}