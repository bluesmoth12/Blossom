import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Book, Image, Save, Lock, Search, Filter, Loader2, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getCurrentUser } from "@/lib/auth";
import Header from "@/components/layout/Header";

interface JournalEntry {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  mood: "good" | "challenging" | "neutral";
  isPrivate: boolean;
}

export default function JournalPage() {
  const [entryTitle, setEntryTitle] = useState("");
  const [entryContent, setEntryContent] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [mood, setMood] = useState<"good" | "challenging" | "neutral">("neutral");
  const [currentUser, setCurrentUser] = useState<{id: number, username: string} | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  // Fetch journal entries
  const { data: journalEntries = [], isLoading: isLoadingEntries } = useQuery<JournalEntry[]>({
    queryKey: ['/api/journal-entries'],
  });

  // Create journal entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (entryData: { userId: number; title: string; content: string; mood: "good" | "challenging" | "neutral"; isPrivate: boolean }) => {
      const response = await apiRequest(
        "POST",
        "/api/journal-entries", 
        entryData
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Entry saved!",
        description: "Your journal entry has been saved successfully.",
      });
      
      // Reset form
      resetForm();
      
      // Refresh journal entries
      queryClient.invalidateQueries({ queryKey: ['/api/journal-entries'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save journal entry. Please try again.",
      });
    },
  });

  const handleSaveEntry = async () => {
    if (!entryTitle.trim() || !entryContent.trim()) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide both a title and content for your journal entry.",
      });
      return;
    }

    if (!currentUser?.id) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You must be logged in to save a journal entry.",
      });
      return;
    }

    await createEntryMutation.mutateAsync({
      userId: currentUser.id,  // Include the user ID
      title: entryTitle,
      content: entryContent,
      mood,
      isPrivate
    });
  };

  // Reset form on successful save
  const resetForm = () => {
    setEntryTitle("");
    setEntryContent("");
    setMood("neutral");
    setIsPrivate(true);
  };

  return (
    <div className="pt-20 pb-24 px-4">
      <Header title="Private Journal" />
      
      <div className="container mx-auto max-w-4xl">
        {/* New Entry Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-primary">New Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Input 
                type="text" 
                placeholder="Entry title..." 
                value={entryTitle}
                onChange={(e) => setEntryTitle(e.target.value)}
                className="px-4 py-3 rounded-xl"
              />
            </div>
            
            <div className="mb-6">
              <Textarea 
                placeholder="Write about your skin journey, feelings, or whatever is on your mind..." 
                value={entryContent}
                onChange={(e) => setEntryContent(e.target.value)}
                className="w-full p-4 h-40 rounded-xl"
              />
              
              <div className="mt-3 flex flex-col space-y-2">
                <p className="text-sm text-neutral-dark font-medium">How are you feeling today?</p>
                <div className="flex space-x-3">
                  <Button 
                    variant={mood === "good" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMood("good")}
                    className={`px-4 py-2 rounded-full ${
                      mood === "good" 
                        ? "bg-green-100 text-green-700 hover:bg-green-200" 
                        : "bg-neutral-lightest hover:bg-neutral-light text-neutral-dark"
                    }`}
                  >
                    <Smile className="h-4 w-4 mr-2" />
                    Good
                  </Button>
                  <Button 
                    variant={mood === "neutral" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMood("neutral")}
                    className={`px-4 py-2 rounded-full ${
                      mood === "neutral" 
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200" 
                        : "bg-neutral-lightest hover:bg-neutral-light text-neutral-dark"
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                      <line x1="8" x2="16" y1="15" y2="15" />
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                    Neutral
                  </Button>
                  <Button 
                    variant={mood === "challenging" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMood("challenging")}
                    className={`px-4 py-2 rounded-full ${
                      mood === "challenging" 
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200" 
                        : "bg-neutral-lightest hover:bg-neutral-light text-neutral-dark"
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="8" x2="16" y1="16" y2="16" />
                      <line x1="9" x2="9.01" y1="9" y2="9" />
                      <line x1="15" x2="15.01" y1="9" y2="9" />
                    </svg>
                    Challenging
                  </Button>
                </div>
                
                <div className="flex space-x-3 mt-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-lightest hover:bg-neutral-light text-neutral-dark"
                  >
                    <Image className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="outline"
                    size="icon" 
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-lightest hover:bg-neutral-light text-neutral-dark"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Button 
                className="flex-1 py-3 px-4 bg-primary-light hover:bg-primary text-white font-medium rounded-full"
                onClick={handleSaveEntry}
                disabled={createEntryMutation.isPending}
              >
                {createEntryMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Entry
                  </>
                )}
              </Button>
              <Button
                variant={isPrivate ? "default" : "outline"}
                className={`py-3 px-4 ${
                  isPrivate 
                    ? "border border-primary text-primary hover:bg-primary hover:text-white" 
                    : "bg-primary text-white"
                } font-medium rounded-full`}
                onClick={() => setIsPrivate(!isPrivate)}
              >
                <Lock className="mr-2 h-4 w-4" />
                Private
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Journal Entries */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-bold text-primary">Your Journal</CardTitle>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" className="p-2 text-neutral-dark hover:text-primary">
                  <Search className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="p-2 text-neutral-dark hover:text-primary">
                  <Filter className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingEntries ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : journalEntries && journalEntries.length > 0 ? (
              <div className="space-y-4">
                {journalEntries.map((entry) => (
                  <div key={entry.id} className="p-4 border border-neutral-light rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-medium text-primary">{entry.title}</div>
                      <div className="text-xs text-neutral-dark">
                        {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <p className="text-sm text-neutral-dark mb-3 line-clamp-2">{entry.content}</p>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className={`inline-block w-4 h-4 rounded-full ${
                          entry.mood === 'good' ? 'bg-green-500' :
                          entry.mood === 'challenging' ? 'bg-amber-500' : 'bg-blue-500'
                        } mr-2`}></span>
                        <span className="text-xs text-neutral-dark">
                          {entry.mood === 'good' ? 'Good day' :
                           entry.mood === 'challenging' ? 'Challenging day' : 'Neutral day'}
                        </span>
                      </div>
                      <Button variant="link" className="text-primary hover:text-primary-dark text-sm p-0">
                        Continue reading
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <Book className="h-12 w-12 text-neutral-medium mx-auto mb-3" />
                <p className="text-neutral-dark">Your journal is empty. Start writing today!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
