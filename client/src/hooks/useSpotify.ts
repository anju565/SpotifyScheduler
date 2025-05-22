import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SpotifyTrack, SpotifyPlaylist } from "@shared/schema";

export function useSpotify() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | undefined>(undefined);
  const [currentPlaylist, setCurrentPlaylist] = useState<SpotifyPlaylist | undefined>(undefined);
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | undefined>(undefined);

  // Check if user is connected to Spotify
  const { data: connectionStatus, refetch: refetchConnectionStatus } = useQuery({
    queryKey: ['/api/spotify/status'],
    retry: false,
    refetchInterval: 3000, // Check connection status every 3 seconds
    refetchOnWindowFocus: true,
  });
  
  // Update connection status when data changes
  useEffect(() => {
    if (connectionStatus) {
      setIsConnected(connectionStatus.connected);
    }
  }, [connectionStatus]);

  // Get user's playlists if connected
  const { data: playlistsData } = useQuery({
    queryKey: ['/api/spotify/playlists'],
    enabled: isConnected,
    retry: false,
  });

  // Connect to Spotify
  const { mutate: connectMutate } = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/spotify/auth-url", undefined);
      const data = await response.json();
      // Redirect to Spotify auth
      window.location.href = data.url;
      return data;
    },
  });

  // Play a track from the selected playlist
  const { mutate: playTrackMutate } = useMutation({
    mutationFn: async () => {
      // Use first playlist as default if none selected
      const playlistToUse = selectedPlaylist || (playlistsData?.playlists && playlistsData.playlists.length > 0 
        ? playlistsData.playlists[0] 
        : null);
      
      if (!playlistToUse) return null;
      
      console.log("Playing track from playlist:", playlistToUse.name);
      
      const response = await apiRequest(
        "POST", 
        "/api/spotify/play", 
        { playlistId: playlistToUse.id }
      );
      return response.json();
    },
    onSuccess: (data) => {
      if (data) {
        console.log("Track data received:", data);
        setCurrentTrack(data.track);
        
        // If this was default playlist selection, update the state
        if (!selectedPlaylist && data.playlist) {
          setSelectedPlaylist(data.playlist);
        }
      }
    },
  });

  // Get current playing track
  const { data: currentPlayingData, refetch: refetchCurrentPlaying } = useQuery({
    queryKey: ['/api/spotify/currently-playing'],
    enabled: isConnected && !isConnected,
    refetchInterval: 10000, // Refetch every 10 seconds when playing
  });

  // Effect to update current track when playing data changes
  useEffect(() => {
    if (currentPlayingData) {
      setCurrentTrack(currentPlayingData.track);
    }
  }, [currentPlayingData]);

  // Effect to play track when entering break mode
  useEffect(() => {
    if (selectedPlaylist) {
      setCurrentPlaylist(selectedPlaylist);
    }
  }, [selectedPlaylist]);

  // Set default playlist if available
  useEffect(() => {
    if (playlistsData?.playlists?.length && !selectedPlaylist) {
      setSelectedPlaylist(playlistsData.playlists[0]);
    }
  }, [playlistsData, selectedPlaylist]);

  // When not connected, provide mock data for the UI
  const playlists = playlistsData?.playlists || [];
  
  // If we're connected but no current track is set, create a placeholder track
  if (isConnected && !currentTrack) {
    setCurrentTrack({
      id: "placeholder",
      name: "Lo-Fi Study Beats",
      artists: ["Study Music Collective"],
      albumArt: "",
      uri: ""
    });
  }

  const connect = () => {
    connectMutate();
  };

  const playTrackFromPlaylist = () => {
    playTrackMutate();
  };

  return {
    isConnected,
    connect,
    playlists,
    selectedPlaylist,
    setSelectedPlaylist,
    currentTrack,
    currentPlaylist,
    playTrackFromPlaylist,
    refetchCurrentPlaying,
  };
}
