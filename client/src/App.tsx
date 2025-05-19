import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import HomePage from "@/pages/home/HomePage";
import SkinAnalysisPage from "@/pages/features/SkinAnalysisPage";
import SkincareTrackerPage from "@/pages/features/SkincareTrackerPage";
import MeditationPage from "@/pages/features/MeditationPage";
import JournalPage from "@/pages/features/JournalPage";
import ProfilePage from "@/pages/features/ProfilePage";
import Navigation from "@/components/layout/Navigation";
import { getCurrentUser } from "./lib/auth";

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [location] = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      setIsAuthenticated(!!user);
    };
    
    checkAuth();
  }, [location]);

  // Don't show navigation on auth pages
  const showNavigation = !location.startsWith("/auth");

  return (
    <>
      <Switch>
        <Route path="/auth/login" component={LoginPage} />
        <Route path="/auth/signup" component={SignupPage} />
        
        {/* Protected routes */}
        <Route path="/">
          {isAuthenticated ? <HomePage /> : <LoginPage />}
        </Route>
        <Route path="/skin-analysis">
          {isAuthenticated ? <SkinAnalysisPage /> : <LoginPage />}
        </Route>
        <Route path="/skincare-tracker">
          {isAuthenticated ? <SkincareTrackerPage /> : <LoginPage />}
        </Route>
        <Route path="/meditation">
          {isAuthenticated ? <MeditationPage /> : <LoginPage />}
        </Route>
        <Route path="/journal">
          {isAuthenticated ? <JournalPage /> : <LoginPage />}
        </Route>
        <Route path="/profile">
          {isAuthenticated ? <ProfilePage /> : <LoginPage />}
        </Route>
        
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
      
      {showNavigation && isAuthenticated && <Navigation />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
