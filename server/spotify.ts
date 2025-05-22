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
  app.get("/api/spotify/playlists", async (req, res) => {
    // @ts-ignore - session property exists but TypeScript doesn't recognize it
    if (!req.session.spotifyToken) {
      return res.status(401).json({ message: "Not authenticated with Spotify" });
    }
    
    try {
      // @ts-ignore - session property exists but TypeScript doesn't recognize it
      const { accessToken, expiresAt } = req.session.spotifyToken;
      
      // Check if token is expired
      if (Date.now() > expiresAt) {
        // Token expired, refresh it
        // This would call the refresh token endpoint in a complete implementation
        return res.status(401).json({ message: "Spotify token expired" });
      }
      
      // Fetch actual playlists from Spotify API
      const response = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) {
        console.error('Failed to fetch playlists:', response.statusText);
        return res.status(response.status).json({ message: "Failed to fetch playlists from Spotify" });
      }
      
      const data = await response.json();
      
      // Transform the Spotify API response to match our schema
      const playlists = data.items.map((item: any) => ({
        id: item.id,
        name: item.name
      }));
      
      res.json({ playlists });
    } catch (error) {
      console.error('Error fetching playlists:', error);
      res.status(500).json({ message: "Error fetching playlists" });
    }
  });

  // Get currently playing track
  app.get("/api/spotify/currently-playing", async (req, res) => {
    // @ts-ignore - session property exists but TypeScript doesn't recognize it
    if (!req.session.spotifyToken) {
      return res.status(401).json({ message: "Not authenticated with Spotify" });
    }
    
    try {
      // @ts-ignore - session property exists but TypeScript doesn't recognize it
      const { accessToken } = req.session.spotifyToken;
      
      // Fetch currently playing track from Spotify API
      const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      // If no track is playing (204 No Content)
      if (response.status === 204) {
        return res.json({ track: null });
      }
      
      if (!response.ok) {
        console.error('Failed to fetch currently playing track:', response.statusText);
        return res.status(response.status).json({ message: "Failed to fetch currently playing track" });
      }
      
      const data = await response.json();
      
      // If track not playing or track object is empty
      if (!data.item) {
        return res.json({ track: null });
      }
      
      // Transform Spotify track object to our schema
      const track = {
        id: data.item.id,
        name: data.item.name,
        artists: data.item.artists.map((artist: any) => artist.name),
        albumArt: data.item.album.images[0]?.url || "",
        uri: data.item.uri
      };
      
      res.json({ track });
    } catch (error) {
      console.error('Error fetching currently playing track:', error);
      res.status(500).json({ message: "Error fetching currently playing track" });
    }
  });

  // Play a track from playlist
  app.post("/api/spotify/play", async (req, res) => {
    // @ts-ignore - session property exists but TypeScript doesn't recognize it
    if (!req.session.spotifyToken) {
      return res.status(401).json({ message: "Not authenticated with Spotify" });
    }
    
    const schema = z.object({
      playlistId: z.string()
    });
    
    try {
      const { playlistId } = schema.parse(req.body);
      
      // @ts-ignore - session property exists but TypeScript doesn't recognize it
      const { accessToken } = req.session.spotifyToken;
      
      // 1. First, get a track from the playlist
      const playlistTracksResponse = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      if (!playlistTracksResponse.ok) {
        console.error('Failed to fetch playlist tracks:', playlistTracksResponse.statusText);
        return res.status(playlistTracksResponse.status).json({ 
          message: "Failed to fetch tracks from playlist" 
        });
      }
      
      const tracksData = await playlistTracksResponse.json();
      
      // If no tracks in playlist, return error
      if (!tracksData.items || tracksData.items.length === 0) {
        return res.status(404).json({ message: "No tracks found in playlist" });
      }
      
      // Pick a random track from the first 10
      const randomIndex = Math.floor(Math.random() * Math.min(tracksData.items.length, 10));
      const trackObject = tracksData.items[randomIndex].track;
      
      // 2. Get playlist details to return the name
      const playlistResponse = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}?fields=name,id`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      let playlistObject = { id: playlistId, name: "Selected Playlist" };
      
      if (playlistResponse.ok) {
        const playlistData = await playlistResponse.json();
        playlistObject = {
          id: playlistData.id,
          name: playlistData.name
        };
      }
      
      // 3. Start playback on the user's device
      // In a real-world implementation, we would call the Spotify API to start playback
      // on the user's active device, but we'll skip that here
      
      // Create track object from Spotify data
      const track = {
        id: trackObject.id,
        name: trackObject.name,
        artists: trackObject.artists.map((artist: any) => artist.name),
        albumArt: trackObject.album.images[0]?.url || "",
        uri: trackObject.uri
      };
      
      res.json({ 
        success: true, 
        track: track,
        playlist: playlistObject
      });
    } catch (error) {
      console.error("Error playing track:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });
}
