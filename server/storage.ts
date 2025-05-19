import { 
  type User, 
  type InsertUser, 
  type SkinAnalysis, 
  type InsertSkinAnalysis, 
  type SkincareRoutine, 
  type InsertSkincareRoutine, 
  type Meditation, 
  type MeditationHistory, 
  type InsertMeditationHistory, 
  type JournalEntry, 
  type InsertJournalEntry
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Skin Analysis methods
  createSkinAnalysis(analysis: InsertSkinAnalysis): Promise<SkinAnalysis>;
  getSkinAnalysisHistory(userId: number): Promise<SkinAnalysis[]>;
  getSkinAnalysis(id: number): Promise<SkinAnalysis | undefined>;
  
  // Skincare Routine methods
  createSkincareRoutine(routine: InsertSkincareRoutine): Promise<SkincareRoutine>;
  getSkincareRoutineByDate(userId: number, date: string): Promise<SkincareRoutine | undefined>;
  getSkincareConsistency(userId: number): Promise<{
    completedDays: number;
    weeklyGoal: number;
    streak: number;
    lastSevenDays: { day: string; completed: boolean }[];
  }>;
  
  // Meditation methods
  getFeaturedMeditation(): Promise<Meditation>;
  getMeditationCategories(): Promise<{
    id: number;
    name: string;
    icon: string;
    count: number;
    color: string;
  }[]>;
  getRecentMeditations(userId: number): Promise<{
    id: number;
    title: string;
    duration: number;
    lastPlayed: string;
    color: string;
  }[]>;
  recordMeditationHistory(history: InsertMeditationHistory): Promise<MeditationHistory>;
  
  // Journal methods
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntries(userId: number): Promise<JournalEntry[]>;
  getJournalEntry(userId: number, entryId: number): Promise<JournalEntry | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private skinAnalyses: Map<number, SkinAnalysis>;
  private skincareRoutines: Map<number, SkincareRoutine>;
  private meditations: Map<number, Meditation>;
  private meditationHistory: Map<number, MeditationHistory>;
  private journalEntries: Map<number, JournalEntry>;
  
  private currentUserId: number;
  private currentSkinAnalysisId: number;
  private currentSkincareRoutineId: number;
  private currentMeditationId: number;
  private currentMeditationHistoryId: number;
  private currentJournalEntryId: number;

  constructor() {
    this.users = new Map();
    this.skinAnalyses = new Map();
    this.skincareRoutines = new Map();
    this.meditations = new Map();
    this.meditationHistory = new Map();
    this.journalEntries = new Map();
    
    this.currentUserId = 1;
    this.currentSkinAnalysisId = 1;
    this.currentSkincareRoutineId = 1;
    this.currentMeditationId = 1;
    this.currentMeditationHistoryId = 1;
    this.currentJournalEntryId = 1;
    
    // Initialize with mock meditation data
    this.initializeMeditations();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  // Skin Analysis methods
  async createSkinAnalysis(insertAnalysis: InsertSkinAnalysis): Promise<SkinAnalysis> {
    const id = this.currentSkinAnalysisId++;
    const now = new Date();
    const analysis: SkinAnalysis = {
      ...insertAnalysis,
      id,
      createdAt: now
    };
    this.skinAnalyses.set(id, analysis);
    return analysis;
  }
  
  async getSkinAnalysisHistory(userId: number): Promise<SkinAnalysis[]> {
    return Array.from(this.skinAnalyses.values())
      .filter(analysis => analysis.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getSkinAnalysis(id: number): Promise<SkinAnalysis | undefined> {
    return this.skinAnalyses.get(id);
  }
  
  // Skincare Routine methods
  async createSkincareRoutine(insertRoutine: InsertSkincareRoutine): Promise<SkincareRoutine> {
    const id = this.currentSkincareRoutineId++;
    const now = new Date();
    const routine: SkincareRoutine = {
      ...insertRoutine,
      id,
      createdAt: now
    };
    this.skincareRoutines.set(id, routine);
    return routine;
  }
  
  async getSkincareRoutineByDate(userId: number, date: string): Promise<SkincareRoutine | undefined> {
    return Array.from(this.skincareRoutines.values())
      .find(routine => 
        routine.userId === userId && 
        routine.date.toISOString().split('T')[0] === date
      );
  }
  
  async getSkincareConsistency(userId: number): Promise<{
    completedDays: number;
    weeklyGoal: number;
    streak: number;
    lastSevenDays: { day: string; completed: boolean }[];
  }> {
    // Get user's routines sorted by date descending
    const userRoutines = Array.from(this.skincareRoutines.values())
      .filter(routine => routine.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Calculate last seven days
    const today = new Date();
    const lastSevenDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStr = date.toISOString().split('T')[0];
      const dayOfWeek = ["S", "M", "T", "W", "T", "F", "S"][date.getDay()];
      
      const completed = userRoutines.some(
        routine => routine.date.toISOString().split('T')[0] === dayStr
      );
      
      return { day: dayOfWeek, completed };
    }).reverse();
    
    // Calculate streak
    let streak = 0;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    for (let i = 0; i < 30; i++) { // Check up to 30 days back
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasRoutine = userRoutines.some(
        routine => routine.date.toISOString().split('T')[0] === dateStr
      );
      
      if (hasRoutine) {
        streak++;
      } else if (i > 0) { // Allow today to be missing
        break;
      }
    }
    
    // Count completed days in last 7 days
    const completedDays = lastSevenDays.filter(day => day.completed).length;
    
    return {
      completedDays,
      weeklyGoal: Math.round((completedDays / 7) * 100),
      streak,
      lastSevenDays
    };
  }
  
  // Meditation methods
  private initializeMeditations() {
    const mockMeditations: Meditation[] = [
      {
        id: 1,
        title: "Stress Relief for Clearer Skin",
        description: "This meditation helps reduce stress hormones that can trigger skin problems. Practice regularly for best results.",
        audioUrl: "/assets/meditations/stress-relief.mp3",
        imageUrl: "https://images.unsplash.com/photo-1520206183501-b80df61043c2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
        duration: 8,
        category: "stress-relief",
        level: "beginner",
        createdAt: new Date()
      },
      {
        id: 2,
        title: "Morning Skin Positivity",
        description: "Start your day with positive affirmations about your skin and body.",
        audioUrl: "/assets/meditations/morning-positivity.mp3",
        imageUrl: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400",
        duration: 5,
        category: "self-acceptance",
        level: "beginner",
        createdAt: new Date()
      },
      {
        id: 3,
        title: "Bedtime Relaxation",
        description: "Calm your mind and body before sleep, promoting better rest and skin recovery.",
        audioUrl: "/assets/meditations/bedtime-relaxation.mp3",
        imageUrl: "https://images.unsplash.com/photo-1511295742362-92c96b055702?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400",
        duration: 10,
        category: "better-sleep",
        level: "beginner",
        createdAt: new Date()
      }
    ];
    
    mockMeditations.forEach(meditation => {
      this.meditations.set(meditation.id, meditation);
      this.currentMeditationId = Math.max(this.currentMeditationId, meditation.id + 1);
    });
  }
  
  async getFeaturedMeditation(): Promise<Meditation> {
    return this.meditations.get(1) as Meditation; // Default to first meditation
  }
  
  async getMeditationCategories(): Promise<{
    id: number;
    name: string;
    icon: string;
    count: number;
    color: string;
  }[]> {
    const categories = new Map<string, {
      id: number;
      name: string;
      icon: string;
      count: number;
      color: string;
    }>();
    
    const categoryMapping = {
      "stress-relief": {
        name: "Stress Relief",
        icon: "mental-health",
        color: "primary"
      },
      "self-acceptance": {
        name: "Self-Acceptance",
        icon: "emotion-happy",
        color: "secondary"
      },
      "better-sleep": {
        name: "Better Sleep",
        icon: "sleep",
        color: "accent"
      },
      "focus-clarity": {
        name: "Focus & Clarity",
        icon: "focus",
        color: "primary-light"
      }
    };
    
    // Initialize categories
    Object.entries(categoryMapping).forEach(([key, info], index) => {
      categories.set(key, {
        id: index + 1,
        name: info.name,
        icon: info.icon,
        count: 0,
        color: info.color
      });
    });
    
    // Count meditations in each category
    Array.from(this.meditations.values()).forEach(meditation => {
      const category = categories.get(meditation.category);
      if (category) {
        category.count += 1;
      }
    });
    
    return Array.from(categories.values());
  }
  
  async getRecentMeditations(userId: number): Promise<{
    id: number;
    title: string;
    duration: number;
    lastPlayed: string;
    color: string;
  }[]> {
    // Get user's meditation history
    const userHistory = Array.from(this.meditationHistory.values())
      .filter(history => history.userId === userId)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    
    // Map to return format with meditation details
    return userHistory.slice(0, 5).map(history => {
      const meditation = this.meditations.get(history.meditationId);
      const colorMapping: Record<string, string> = {
        "stress-relief": "primary",
        "self-acceptance": "secondary",
        "better-sleep": "accent",
        "focus-clarity": "primary-light"
      };
      
      const daysAgo = Math.floor(
        (new Date().getTime() - new Date(history.completedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return {
        id: meditation?.id || 0,
        title: meditation?.title || "Unknown Meditation",
        duration: meditation?.duration || 0,
        lastPlayed: daysAgo <= 0 ? "today" : daysAgo === 1 ? "yesterday" : `${daysAgo}d ago`,
        color: colorMapping[meditation?.category || ""] || "primary"
      };
    });
  }
  
  async recordMeditationHistory(insertHistory: InsertMeditationHistory): Promise<MeditationHistory> {
    const id = this.currentMeditationHistoryId++;
    const now = new Date();
    const history: MeditationHistory = {
      ...insertHistory,
      id,
      completedAt: now
    };
    this.meditationHistory.set(id, history);
    return history;
  }
  
  // Journal methods
  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.currentJournalEntryId++;
    const now = new Date();
    const entry: JournalEntry = {
      ...insertEntry,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.journalEntries.set(id, entry);
    return entry;
  }
  
  async getJournalEntries(userId: number): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getJournalEntry(userId: number, entryId: number): Promise<JournalEntry | undefined> {
    const entry = this.journalEntries.get(entryId);
    if (entry && entry.userId === userId) {
      return entry;
    }
    return undefined;
  }
}

// Import the database storage implementation
import { DatabaseStorage } from "./storage-db";

// Switch from MemStorage to DatabaseStorage
export const storage = new DatabaseStorage();
