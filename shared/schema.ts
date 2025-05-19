import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
});

// Skin Analysis table
export const skinAnalyses = pgTable("skin_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  image: text("image").notNull(), // Store image URL or path
  analysis: json("analysis").notNull(), // Store full analysis as JSON
  summary: text("summary").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSkinAnalysisSchema = createInsertSchema(skinAnalyses).pick({
  userId: true,
  image: true,
  analysis: true,
  summary: true,
});

// Skincare Routine table
export const skincareRoutines = pgTable("skincare_routines", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: timestamp("date").notNull(),
  steps: json("steps").notNull(), // Store steps as JSON array
  notes: text("notes"),
  skinStatus: text("skin_status"), // "better", "same", or "worse"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSkincareRoutineSchema = createInsertSchema(skincareRoutines).pick({
  userId: true,
  date: true,
  steps: true,
  notes: true,
  skinStatus: true,
});

// Meditations table
export const meditations = pgTable("meditations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  audioUrl: text("audio_url").notNull(),
  imageUrl: text("image_url").notNull(),
  duration: integer("duration").notNull(), // in minutes
  category: text("category").notNull(),
  level: text("level").notNull(), // "beginner", "intermediate", "advanced"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User Meditation History table
export const meditationHistory = pgTable("meditation_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  meditationId: integer("meditation_id").references(() => meditations.id).notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  isFavorite: boolean("is_favorite").default(false),
});

export const insertMeditationHistorySchema = createInsertSchema(meditationHistory).pick({
  userId: true,
  meditationId: true,
  isFavorite: true,
});

// Journal Entries table
export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  mood: text("mood"), // "good", "challenging", "neutral"
  isPrivate: boolean("is_private").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  userId: true,
  title: true,
  content: true,
  mood: true,
  isPrivate: true,
});

// Types for the schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSkinAnalysis = z.infer<typeof insertSkinAnalysisSchema>;
export type SkinAnalysis = typeof skinAnalyses.$inferSelect;

export type InsertSkincareRoutine = z.infer<typeof insertSkincareRoutineSchema>;
export type SkincareRoutine = typeof skincareRoutines.$inferSelect;

export type Meditation = typeof meditations.$inferSelect;

export type InsertMeditationHistory = z.infer<typeof insertMeditationHistorySchema>;
export type MeditationHistory = typeof meditationHistory.$inferSelect;

export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
