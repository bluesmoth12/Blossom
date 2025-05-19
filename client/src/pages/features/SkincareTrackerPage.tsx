import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Sun, Moon, PlusCircle, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/Header";

interface RoutineStep {
  id: number;
  name: string;
  completed: boolean;
  time: "morning" | "evening";
}

interface SkinRoutine {
  date: string;
  steps: RoutineStep[];
  notes: string;
  status: "better" | "same" | "worse" | "";
}

interface ConsistencyData {
  completedDays: number;
  weeklyGoal: number;
  streak: number;
  lastSevenDays: { day: string; completed: boolean }[];
}

export default function SkincareTrackerPage() {
  const [routine, setRoutine] = useState<SkinRoutine>({
    date: new Date().toISOString().split('T')[0],
    steps: [
      { id: 1, name: "Cleanse", completed: false, time: "morning" },
      { id: 2, name: "Tone", completed: false, time: "morning" },
      { id: 3, name: "Moisturize", completed: false, time: "morning" },
      { id: 4, name: "SPF Protection", completed: false, time: "morning" },
      { id: 5, name: "Remove Makeup", completed: false, time: "evening" },
      { id: 6, name: "Cleanse", completed: false, time: "evening" },
      { id: 7, name: "Treatment", completed: false, time: "evening" },
      { id: 8, name: "Moisturize", completed: false, time: "evening" },
    ],
    notes: "",
    status: "",
  });
  const [newStep, setNewStep] = useState("");
  const [addingMorningStep, setAddingMorningStep] = useState(false);
  const [addingEveningStep, setAddingEveningStep] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  // Fetch today's routine
  const { data: todayRoutine, isLoading: isLoadingRoutine } = useQuery<SkinRoutine>({
    queryKey: ['/api/skincare-routine', routine.date],
  });

  // Fetch consistency data
  const { data: consistencyData, isLoading: isLoadingConsistency } = useQuery<ConsistencyData>({
    queryKey: ['/api/skincare-consistency'],
  });

  // Use effect to update routine with fetched data
  useEffect(() => {
    if (todayRoutine && !isLoadingRoutine) {
      setRoutine(prev => ({
        ...prev,
        ...todayRoutine,
        steps: todayRoutine.steps || prev.steps
      }));
    }
  }, [todayRoutine, isLoadingRoutine]);
  
  // Save routine mutation
  const saveRoutineMutation = useMutation({
    mutationFn: async (routineData: SkinRoutine) => {
      const response = await apiRequest(
        "POST",
        "/api/skincare-routine", 
        routineData
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Routine saved!",
        description: "Your skincare routine has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/skincare-routine'] });
      queryClient.invalidateQueries({ queryKey: ['/api/skincare-consistency'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Save failed",
        description: error instanceof Error ? error.message : "Failed to save routine. Please try again.",
      });
    },
  });

  // Effect to update routine with fetched data
  if (todayRoutine && !isLoadingRoutine) {
    // This would be in a useEffect in a real implementation
  }

  const handleStepChange = (stepId: number, checked: boolean) => {
    setRoutine(prev => ({
      ...prev,
      steps: prev.steps.map(step => 
        step.id === stepId ? { ...step, completed: checked } : step
      )
    }));
  };

  const handleStatusChange = (status: "better" | "same" | "worse") => {
    setRoutine(prev => ({
      ...prev,
      status
    }));
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRoutine(prev => ({
      ...prev,
      notes: e.target.value
    }));
  };

  const addNewStep = (time: "morning" | "evening") => {
    if (!newStep.trim()) return;
    
    const maxId = Math.max(...routine.steps.map(step => step.id), 0);
    
    setRoutine(prev => ({
      ...prev,
      steps: [
        ...prev.steps,
        { id: maxId + 1, name: newStep, completed: false, time }
      ]
    }));
    
    setNewStep("");
    if (time === "morning") {
      setAddingMorningStep(false);
    } else {
      setAddingEveningStep(false);
    }
  };

  const saveRoutine = async () => {
    await saveRoutineMutation.mutateAsync(routine);
  };

  return (
    <div className="pt-20 pb-24 px-4">
      <Header title="Daily Skincare Tracker" />
      
      <div className="container mx-auto max-w-4xl">
        {/* Today's Tracker */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-heading text-xl font-bold text-primary">Today's Routine</h2>
              <div className="text-sm font-medium text-neutral-dark">{currentDate}</div>
            </div>
            
            {/* Morning Routine */}
            <div className="mb-6">
              <h3 className="font-accent text-lg font-semibold text-secondary flex items-center mb-4">
                <Sun className="mr-2 h-5 w-5" /> Morning Routine
              </h3>
              
              <div className="space-y-3">
                {routine.steps
                  .filter(step => step.time === "morning")
                  .map(step => (
                    <div key={step.id} className="flex items-center p-3 bg-neutral-lightest rounded-xl">
                      <Checkbox 
                        id={`morning-${step.id}`}
                        checked={step.completed}
                        onCheckedChange={(checked) => handleStepChange(step.id, checked === true)}
                        className="h-5 w-5"
                      />
                      <label 
                        htmlFor={`morning-${step.id}`} 
                        className="ml-3 font-medium text-neutral-dark"
                      >
                        {step.name}
                      </label>
                    </div>
                  ))
                }
                
                {addingMorningStep && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newStep}
                      onChange={(e) => setNewStep(e.target.value)}
                      placeholder="Enter step name..."
                      className="flex-1 p-2 border rounded-lg"
                    />
                    <Button 
                      onClick={() => addNewStep("morning")}
                      size="sm"
                    >
                      Add
                    </Button>
                    <Button 
                      onClick={() => setAddingMorningStep(false)}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
              
              {!addingMorningStep && (
                <Button 
                  variant="link" 
                  className="mt-4 flex items-center text-primary hover:text-primary-dark p-0"
                  onClick={() => setAddingMorningStep(true)}
                >
                  <PlusCircle className="mr-1 h-4 w-4" /> Add step
                </Button>
              )}
            </div>
            
            {/* Evening Routine */}
            <div className="mb-6">
              <h3 className="font-accent text-lg font-semibold text-accent flex items-center mb-4">
                <Moon className="mr-2 h-5 w-5" /> Evening Routine
              </h3>
              
              <div className="space-y-3">
                {routine.steps
                  .filter(step => step.time === "evening")
                  .map(step => (
                    <div key={step.id} className="flex items-center p-3 bg-neutral-lightest rounded-xl">
                      <Checkbox 
                        id={`evening-${step.id}`}
                        checked={step.completed}
                        onCheckedChange={(checked) => handleStepChange(step.id, checked === true)}
                        className="h-5 w-5"
                      />
                      <label 
                        htmlFor={`evening-${step.id}`} 
                        className="ml-3 font-medium text-neutral-dark"
                      >
                        {step.name}
                      </label>
                    </div>
                  ))
                }
                
                {addingEveningStep && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newStep}
                      onChange={(e) => setNewStep(e.target.value)}
                      placeholder="Enter step name..."
                      className="flex-1 p-2 border rounded-lg"
                    />
                    <Button 
                      onClick={() => addNewStep("evening")}
                      size="sm"
                    >
                      Add
                    </Button>
                    <Button 
                      onClick={() => setAddingEveningStep(false)}
                      variant="outline"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
              
              {!addingEveningStep && (
                <Button 
                  variant="link" 
                  className="mt-4 flex items-center text-primary hover:text-primary-dark p-0"
                  onClick={() => setAddingEveningStep(true)}
                >
                  <PlusCircle className="mr-1 h-4 w-4" /> Add step
                </Button>
              )}
            </div>
            
            {/* Notes */}
            <div className="mb-6">
              <h3 className="font-accent text-lg font-semibold text-primary flex items-center mb-4">
                <Smile className="mr-2 h-5 w-5" /> How's your skin today?
              </h3>
              
              <div className="flex space-x-3 mb-4">
                <Button 
                  variant={routine.status === "better" ? "default" : "outline"}
                  className={`flex-1 py-2 px-4 rounded-full ${
                    routine.status === "better" ? "bg-primary text-white" : "border border-neutral-medium text-neutral-dark hover:bg-neutral-light"
                  }`}
                  onClick={() => handleStatusChange("better")}
                >
                  Better
                </Button>
                <Button 
                  variant={routine.status === "same" ? "default" : "outline"}
                  className={`flex-1 py-2 px-4 rounded-full ${
                    routine.status === "same" ? "bg-primary text-white" : "border border-neutral-medium text-neutral-dark hover:bg-neutral-light"
                  }`}
                  onClick={() => handleStatusChange("same")}
                >
                  Same
                </Button>
                <Button 
                  variant={routine.status === "worse" ? "default" : "outline"}
                  className={`flex-1 py-2 px-4 rounded-full ${
                    routine.status === "worse" ? "bg-primary text-white" : "border border-neutral-medium text-neutral-dark hover:bg-neutral-light"
                  }`}
                  onClick={() => handleStatusChange("worse")}
                >
                  Worse
                </Button>
              </div>
              
              <Textarea 
                placeholder="Add notes about your skin today..."
                value={routine.notes}
                onChange={handleNotesChange}
                className="w-full p-3 h-24 rounded-xl"
              />
            </div>
            
            <Button 
              className="w-full bg-secondary hover:bg-secondary-dark text-white font-bold py-3 px-4 rounded-xl"
              onClick={saveRoutine}
              disabled={saveRoutineMutation.isPending}
            >
              {saveRoutineMutation.isPending ? "Saving..." : "Save Today's Routine"}
            </Button>
          </CardContent>
        </Card>
        
        {/* Progress Tracker */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-primary">Your Consistency</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingConsistency ? (
              <div className="h-20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-6">
                  {consistencyData?.lastSevenDays?.map((day, index) => {
                    // Determine day of week from index
                    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                    return (
                      <div 
                        key={index} 
                        className={`w-10 h-10 rounded-lg ${
                          day.completed 
                            ? "bg-green-500 text-white" 
                            : "bg-neutral-light text-neutral-dark"
                        } flex items-center justify-center`}
                      >
                        {dayLabels[index]}
                      </div>
                    );
                  }) || (
                    // Fallback if no data
                    Array(7).fill(0).map((_, i) => (
                      <div 
                        key={i} 
                        className="w-10 h-10 rounded-lg bg-neutral-light flex items-center justify-center text-neutral-dark"
                      >
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                      </div>
                    ))
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {consistencyData?.completedDays || 0}/{consistencyData?.weeklyGoal || 7}
                    </div>
                    <div className="text-sm text-neutral-dark">Days completed</div>
                  </div>
                  
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(((consistencyData?.completedDays || 0) / (consistencyData?.weeklyGoal || 7) * 100) || 0)}%
                    </div>
                    <div className="text-sm text-neutral-dark">Weekly goal</div>
                  </div>
                  
                  <div>
                    <div className="text-2xl font-bold text-primary">{consistencyData?.streak || 0}</div>
                    <div className="text-sm text-neutral-dark">Day streak</div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
