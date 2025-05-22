import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  spotifyRefreshToken: text("spotify_refresh_token"),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  studyDuration: integer("study_duration").notNull().default(7200), // 2 hours in seconds
  breakDuration: integer("break_duration").notNull().default(300), // 5 minutes in seconds
  playNotification: boolean("play_notification").notNull().default(true),
  selectedPlaylistId: text("selected_playlist_id"),
  selectedPlaylistName: text("selected_playlist_name"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  spotifyRefreshToken: true,
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  userId: true,
  studyDuration: true,
  breakDuration: true,
  playNotification: true,
  selectedPlaylistId: true,
  selectedPlaylistName: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

// Spotify types
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: string[];
  albumArt: string;
  uri: string;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
}

export const spotifyAuthResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  scope: z.string(),
});
