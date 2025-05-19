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
  type InsertJournalEntry,
  users,
  skinAnalyses,
  skincareRoutines,
  meditations,
  meditationHistory,
  journalEntries
} from "@shared/schema";
import { IStorage } from "./storage";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        username: insertUser.username,
        password: insertUser.password,
        firstName: insertUser.firstName || null,
        lastName: insertUser.lastName || null
      })
      .returning();
    return user;
  }

  // Skin Analysis methods
  async createSkinAnalysis(insertAnalysis: InsertSkinAnalysis): Promise<SkinAnalysis> {
    const [analysis] = await db
      .insert(skinAnalyses)
      .values({
        userId: insertAnalysis.userId,
        image: insertAnalysis.image,
        analysis: insertAnalysis.analysis,
        summary: insertAnalysis.summary
      })
      .returning();
    return analysis;
  }

  async getSkinAnalysisHistory(userId: number): Promise<SkinAnalysis[]> {
    return await db
      .select()
      .from(skinAnalyses)
      .where(eq(skinAnalyses.userId, userId))
      .orderBy(desc(skinAnalyses.createdAt));
  }

  async getSkinAnalysis(id: number): Promise<SkinAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(skinAnalyses)
      .where(eq(skinAnalyses.id, id));
    return analysis;
  }

  // Skincare Routine methods
  async createSkincareRoutine(insertRoutine: InsertSkincareRoutine): Promise<SkincareRoutine> {
    const [routine] = await db
      .insert(skincareRoutines)
      .values({
        userId: insertRoutine.userId,
        date: insertRoutine.date,
        steps: insertRoutine.steps,
        notes: insertRoutine.notes || null,
        skinStatus: insertRoutine.skinStatus || null
      })
      .returning();
    return routine;
  }

  async getSkincareRoutineByDate(userId: number, date: string): Promise<SkincareRoutine | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const [routine] = await db
      .select()
      .from(skincareRoutines)
      .where(
        and(
          eq(skincareRoutines.userId, userId),
          gte(skincareRoutines.date, startOfDay),
          lte(skincareRoutines.date, endOfDay)
        )
      );
      
    return routine;
  }

  async getSkincareConsistency(userId: number): Promise<{
    completedDays: number;
    weeklyGoal: number;
    streak: number;
    lastSevenDays: { day: string; completed: boolean }[];
  }> {
    // Get past 30 days for checking streak
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const userRoutines = await db
      .select()
      .from(skincareRoutines)
      .where(
        and(
          eq(skincareRoutines.userId, userId),
          gte(skincareRoutines.date, thirtyDaysAgo)
        )
      )
      .orderBy(desc(skincareRoutines.date));
    
    // Calculate last seven days
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
  async getFeaturedMeditation(): Promise<Meditation> {
    // Get first meditation (to be enhanced in a real app)
    const [meditation] = await db
      .select()
      .from(meditations)
      .limit(1);
    
    if (!meditation) {
      // Initialize with default meditation if none exists
      await this.initializeMeditations();
      const [newMeditation] = await db
        .select()
        .from(meditations)
        .limit(1);
      return newMeditation;
    }
    
    return meditation;
  }

  private async initializeMeditations() {
    // Check if meditations exist
    const existingMeditations = await db.select().from(meditations);
    if (existingMeditations.length > 0) return;
    
    // Add default meditation data
    await db.insert(meditations).values([
      {
        title: "Stress Relief for Clearer Skin",
        description: "This meditation helps reduce stress hormones that can trigger skin problems. Practice regularly for best results.",
        audioUrl: "/assets/meditations/stress-relief.mp3",
        imageUrl: "https://images.unsplash.com/photo-1520206183501-b80df61043c2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400",
        duration: 8,
        category: "stress-relief",
        level: "beginner"
      },
      {
        title: "Morning Skin Positivity",
        description: "Start your day with positive affirmations about your skin and body.",
        audioUrl: "/assets/meditations/morning-positivity.mp3",
        imageUrl: "https://images.unsplash.com/photo-1519834785169-98be25ec3f84?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400",
        duration: 5,
        category: "self-acceptance",
        level: "beginner"
      },
      {
        title: "Bedtime Relaxation",
        description: "Calm your mind and body before sleep, promoting better rest and skin recovery.",
        audioUrl: "/assets/meditations/bedtime-relaxation.mp3",
        imageUrl: "https://images.unsplash.com/photo-1511295742362-92c96b055702?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=400",
        duration: 10,
        category: "better-sleep",
        level: "beginner"
      }
    ]);
  }

  async getMeditationCategories(): Promise<{
    id: number;
    name: string;
    icon: string;
    count: number;
    color: string;
  }[]> {
    // Ensure meditations exist
    await this.initializeMeditations();
    
    // Get all meditations
    const allMeditations = await db.select().from(meditations);
    
    // Count by category
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
    const categoryCounts = new Map<string, number>();
    
    // Count meditations per category
    allMeditations.forEach(meditation => {
      const currentCount = categoryCounts.get(meditation.category) || 0;
      categoryCounts.set(meditation.category, currentCount + 1);
    });
    
    // Build result
    const result: {
      id: number;
      name: string;
      icon: string;
      count: number;
      color: string;
    }[] = [];
    
    Object.entries(categoryMapping).forEach(([category, info], index) => {
      result.push({
        id: index + 1,
        name: info.name,
        icon: info.icon,
        count: categoryCounts.get(category) || 0,
        color: info.color
      });
    });
    
    return result;
  }

  async getRecentMeditations(userId: number): Promise<{
    id: number;
    title: string;
    duration: number;
    lastPlayed: string;
    color: string;
  }[]> {
    // Get user's recent meditations with join to get meditation details
    const recentHistory = await db
      .select({
        id: meditations.id,
        title: meditations.title,
        duration: meditations.duration,
        completedAt: meditationHistory.completedAt,
        category: meditations.category
      })
      .from(meditationHistory)
      .innerJoin(meditations, eq(meditationHistory.meditationId, meditations.id))
      .where(eq(meditationHistory.userId, userId))
      .orderBy(desc(meditationHistory.completedAt))
      .limit(5);
    
    // Color mapping
    const colorMapping: Record<string, string> = {
      "stress-relief": "primary",
      "self-acceptance": "secondary",
      "better-sleep": "accent",
      "focus-clarity": "primary-light"
    };
    
    // Format days ago
    return recentHistory.map(history => {
      const daysAgo = Math.floor(
        (new Date().getTime() - new Date(history.completedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      return {
        id: history.id,
        title: history.title,
        duration: history.duration,
        lastPlayed: daysAgo <= 0 ? "today" : daysAgo === 1 ? "yesterday" : `${daysAgo}d ago`,
        color: colorMapping[history.category] || "primary"
      };
    });
  }

  async recordMeditationHistory(insertHistory: InsertMeditationHistory): Promise<MeditationHistory> {
    const [history] = await db
      .insert(meditationHistory)
      .values({
        userId: insertHistory.userId,
        meditationId: insertHistory.meditationId,
        isFavorite: insertHistory.isFavorite || false
      })
      .returning();
    return history;
  }

  // Journal methods
  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const [entry] = await db
      .insert(journalEntries)
      .values({
        userId: insertEntry.userId,
        title: insertEntry.title,
        content: insertEntry.content,
        mood: insertEntry.mood || null,
        isPrivate: insertEntry.isPrivate || true
      })
      .returning();
    return entry;
  }

  async getJournalEntries(userId: number): Promise<JournalEntry[]> {
    return await db
      .select()
      .from(journalEntries)
      .where(eq(journalEntries.userId, userId))
      .orderBy(desc(journalEntries.createdAt));
  }

  async getJournalEntry(userId: number, entryId: number): Promise<JournalEntry | undefined> {
    const [entry] = await db
      .select()
      .from(journalEntries)
      .where(
        and(
          eq(journalEntries.userId, userId),
          eq(journalEntries.id, entryId)
        )
      );
    return entry;
  }
}