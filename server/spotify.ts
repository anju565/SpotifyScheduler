import type { Express } from "express";
import { z } from "zod";
import { spotifyAuthResponseSchema } from "@shared/schema";

// Mock data for playlists
const mockPlaylists = [
  { id: "playlist1", name: "Study Beats" },
  { id: "playlist2", name: "Focus Music" },
  { id: "playlist3", name: "Productivity Mix" },
  { id: "playlist4", name: "Concentration Playlist" }
];

// Mock data for currently playing track
const mockTrack = {
  id: "track1",
  name: "Lo-Fi Study Beats",
  artists: ["Study Music Collective"],
  albumArt: "https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
  uri: "spotify:track:track1"
};

export function setupSpotifyRoutes(app: Express) {
  // Check if user is connected to Spotify
  app.get("/api/spotify/status", (req, res) => {
    // @ts-ignore - session property exists but TypeScript doesn't recognize it
    const isConnected = req.session.spotifyToken !== undefined;
    res.json({ connected: isConnected });
  });

  // Get Spotify auth URL
  app.get("/api/spotify/auth-url", (req, res) => {
    const clientId = process.env.SPOTIFY_CLIENT_ID || "your-client-id";
    const redirectUri = "https://616094e5-a009-4a5c-9a02-a0429459d8b7-00-3pxhss9dzxwxs.janeway.replit.dev/api/spotify/callback";
    
    const scopes = [
      "user-read-private",
      "user-read-email",
      "user-read-playback-state",
      "user-modify-playback-state",
      "playlist-read-private",
      "playlist-read-collaborative",
      "streaming"
    ];
    
    const authUrl = new URL("https://accounts.spotify.com/authorize");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("scope", scopes.join(" "));
    authUrl.searchParams.append("state", Math.random().toString(36).substring(2, 15));
    
    res.json({ url: authUrl.toString() });
  });

  // Spotify auth callback
  app.get("/api/spotify/callback", async (req, res) => {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).send("Authorization code missing");
    }
    
    try {
      const clientId = process.env.SPOTIFY_CLIENT_ID || "your-client-id";
      const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || "your-client-secret";
      const redirectUri = "https://616094e5-a009-4a5c-9a02-a0429459d8b7-00-3pxhss9dzxwxs.janeway.replit.dev/api/spotify/callback";
      
      // Exchange code for access token
      const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code.toString(),
          redirect_uri: redirectUri
        })
      });
      
      if (!tokenResponse.ok) {
        throw new Error(`Spotify token error: ${tokenResponse.statusText}`);
      }
      
      const tokenData = await tokenResponse.json();
      const parsedToken = spotifyAuthResponseSchema.parse(tokenData);
      
      // Store token in session
      req.session.spotifyToken = {
        accessToken: parsedToken.access_token,
        refreshToken: parsedToken.refresh_token,
        expiresAt: Date.now() + parsedToken.expires_in * 1000
      };
      
      // Redirect to app
      res.redirect("/");
      
    } catch (error) {
      console.error("Spotify auth error:", error);
      res.status(500).send("Authentication failed");
    }
  });

  // Get user's playlists
  app.get("/api/spotify/playlists", (req, res) => {
    if (!req.session.spotifyToken) {
      return res.status(401).json({ message: "Not authenticated with Spotify" });
    }
    
    // In a real app, we would fetch playlists from Spotify API
    res.json({ playlists: mockPlaylists });
  });

  // Get currently playing track
  app.get("/api/spotify/currently-playing", (req, res) => {
    if (!req.session.spotifyToken) {
      return res.status(401).json({ message: "Not authenticated with Spotify" });
    }
    
    // In a real app, we would fetch currently playing from Spotify API
    res.json({ track: mockTrack });
  });

  // Play a track from playlist
  app.post("/api/spotify/play", (req, res) => {
    if (!req.session.spotifyToken) {
      return res.status(401).json({ message: "Not authenticated with Spotify" });
    }
    
    const schema = z.object({
      playlistId: z.string()
    });
    
    try {
      const { playlistId } = schema.parse(req.body);
      
      // In a real app, we would start playback via Spotify API
      // For now, return mock data
      const playlist = mockPlaylists.find(p => p.id === playlistId);
      
      res.json({ 
        success: true, 
        track: mockTrack,
        playlist: playlist || mockPlaylists[0]
      });
    } catch (error) {
      console.error("Error playing track:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });
}
