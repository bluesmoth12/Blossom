import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { compareSync, hashSync } from "bcryptjs";
import { insertUserSchema, insertJournalEntrySchema, insertSkinAnalysisSchema, insertSkincareRoutineSchema } from "@shared/schema";
import MemoryStore from "memorystore";
import crypto from "crypto";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-mockkey" 
});

const MemoryStoreSession = MemoryStore(session);

async function generateMockSkinAnalysis(imageBase64: string) {
  try {
    // Actually call OpenAI in production with this code:
    /*
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        {
          role: "system",
          content: "You are a dermatology AI assistant. Analyze the skin in the image and provide a detailed assessment with recommendations. Format your response as JSON with these fields: skinCondition (general assessment), concerns (array of issues), recommendations (array of suggestions), progress (optional description of any visible progress)."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this skin selfie and provide feedback on the skin condition."
            },
            {
              type: "image_url", 
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
    */

    // Using mock response for now
    return {
      skinCondition: "Mild inflammation with some acne",
      concerns: ["Redness around cheeks", "Several small whiteheads", "Some dryness on forehead"],
      recommendations: [
        "Use a gentle, non-foaming cleanser twice daily",
        "Apply a light, oil-free moisturizer",
        "Consider a product with salicylic acid for the whiteheads",
        "Avoid touching or picking at active breakouts"
      ],
      progress: "Some improvement in overall skin tone compared to typical acne patterns"
    };
  } catch (error) {
    console.error("Error analyzing skin image:", error);
    throw new Error("Failed to analyze skin image");
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString("hex"),
      resave: false,
      saveUninitialized: false,
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Configure Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Local Strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }
        if (!compareSync(password, user.password)) {
          return done(null, false, { message: "Incorrect password." });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Middleware to handle Zod validation errors
  const validateRequest = (schema: any) => {
    return (req: Request, res: Response, next: Function) => {
      try {
        schema.parse(req.body);
        next();
      } catch (error) {
        if (error instanceof ZodError) {
          const validationError = fromZodError(error);
          res.status(400).json({ message: validationError.message });
        } else {
          next(error);
        }
      }
    };
  };

  // Auth routes
  app.post("/api/auth/register", validateRequest(insertUserSchema), async (req, res) => {
    try {
      const { username, password, firstName, lastName } = req.body;
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash password
      const hashedPassword = hashSync(password, 10);
      
      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        firstName,
        lastName,
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    // If this function is called, authentication was successful
    // req.user contains the authenticated user
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/current-user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { password, ...userWithoutPassword } = req.user as any;
    res.json(userWithoutPassword);
  });

  // Middleware to ensure user is authenticated
  const ensureAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Skin Analysis routes
  app.post("/api/analyze-skin", ensureAuthenticated, async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ message: "No image provided" });
      }

      const userId = (req.user as any).id;
      
      // Extract base64 data from the image URL if needed
      let imageBase64 = image;
      if (image.includes('data:image')) {
        // Extract the base64 part if it's a data URL (e.g., data:image/jpeg;base64,/9j/4AAQ...)
        imageBase64 = image.split(',')[1] || image;
      }
      
      // Analyze image
      const analysis = await generateMockSkinAnalysis(imageBase64);
      
      // Save just a thumbnail preview of the image to save space
      // Get the first part of the image data to create a small thumbnail reference
      let thumbnailImage = image;
      if (image.includes('data:image')) {
        const prefix = image.split(',')[0];
        const base64Data = image.split(',')[1];
        if (base64Data && base64Data.length > 200) {
          thumbnailImage = `${prefix},${base64Data.substring(0, 200)}...`;
        }
      } else if (image.length > 200) {
        thumbnailImage = `${image.substring(0, 200)}...`;
      }
      
      // Save analysis to storage
      const savedAnalysis = await storage.createSkinAnalysis({
        userId,
        image: thumbnailImage,
        analysis,
        summary: analysis.skinCondition,
      });
      
      res.json(analysis); // Return the analysis results directly
    } catch (error) {
      console.error("Skin analysis error:", error);
      res.status(500).json({ message: "Failed to analyze skin image" });
    }
  });

  app.get("/api/skin-analysis-history", ensureAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const history = await storage.getSkinAnalysisHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching skin analysis history:", error);
      res.status(500).json({ message: "Failed to fetch skin analysis history" });
    }
  });

  // Skincare Tracker routes
  app.post("/api/skincare-routine", ensureAuthenticated, validateRequest(insertSkincareRoutineSchema), async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { date, steps, notes, skinStatus } = req.body;
      
      const routine = await storage.createSkincareRoutine({
        userId,
        date,
        steps,
        notes,
        skinStatus,
      });
      
      res.json(routine);
    } catch (error) {
      console.error("Error saving skincare routine:", error);
      res.status(500).json({ message: "Failed to save skincare routine" });
    }
  });

  // Get skincare routine - both with and without date parameter
  app.get("/api/skincare-routine/:date?", ensureAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const date = req.params.date || new Date().toISOString().split('T')[0]; // If no date, use today
      
      const routine = await storage.getSkincareRoutineByDate(userId, date);
      
      // If no routine found, return an empty object, not 404
      if (!routine) {
        return res.json({ date });
      }
      
      res.json(routine);
    } catch (error) {
      console.error("Error fetching skincare routine:", error);
      res.status(500).json({ message: "Failed to fetch skincare routine" });
    }
  });

  app.get("/api/skincare-consistency", ensureAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const data = await storage.getSkincareConsistency(userId);
      res.json(data);
    } catch (error) {
      console.error("Error fetching skincare consistency:", error);
      res.status(500).json({ message: "Failed to fetch skincare consistency" });
    }
  });

  // Meditation routes
  app.get("/api/meditations/featured", ensureAuthenticated, async (req, res) => {
    try {
      const featured = await storage.getFeaturedMeditation();
      res.json(featured);
    } catch (error) {
      console.error("Error fetching featured meditation:", error);
      res.status(500).json({ message: "Failed to fetch featured meditation" });
    }
  });

  app.get("/api/meditations/categories", ensureAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getMeditationCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching meditation categories:", error);
      res.status(500).json({ message: "Failed to fetch meditation categories" });
    }
  });

  app.get("/api/meditations/recent", ensureAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const recent = await storage.getRecentMeditations(userId);
      res.json(recent);
    } catch (error) {
      console.error("Error fetching recent meditations:", error);
      res.status(500).json({ message: "Failed to fetch recent meditations" });
    }
  });

  // Journal routes
  app.post("/api/journal-entries", ensureAuthenticated, validateRequest(insertJournalEntrySchema), async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { title, content, mood, isPrivate } = req.body;
      
      const entry = await storage.createJournalEntry({
        userId,
        title,
        content,
        mood,
        isPrivate,
      });
      
      res.json(entry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });

  app.get("/api/journal-entries", ensureAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const entries = await storage.getJournalEntries(userId);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.get("/api/journal-entries/:id", ensureAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const entryId = parseInt(req.params.id, 10);
      
      if (isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }
      
      const entry = await storage.getJournalEntry(userId, entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      res.json(entry);
    } catch (error) {
      console.error("Error fetching journal entry:", error);
      res.status(500).json({ message: "Failed to fetch journal entry" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
