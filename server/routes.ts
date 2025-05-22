import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import { setupSpotifyRoutes } from "./spotify";

const MemoryStoreSession = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup for Spotify auth
  app.use(session({
    secret: process.env.SESSION_SECRET || "spotify-study-timer-secret",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // Prune expired entries every 24h
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
    }
  }));

  // Spotify API routes
  setupSpotifyRoutes(app);

  // API endpoints for settings
  app.get("/api/settings", async (req, res) => {
    try {
      // In a real app, we would get the user ID from the session
      const userId = 1; // Placeholder
      
      // Default settings
      const defaultSettings = {
        studyDuration: 7200,
        breakDuration: 300,
        playNotification: true,
        selectedPlaylistId: null,
        selectedPlaylistName: null
      };
      
      res.json(defaultSettings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.post("/api/settings", async (req, res) => {
    try {
      // In a real app, we would get the user ID from the session
      const userId = 1; // Placeholder
      
      // Save settings
      const settings = req.body;
      
      // Return saved settings
      res.json(settings);
    } catch (error) {
      console.error("Error saving settings:", error);
      res.status(500).json({ message: "Failed to save settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
