import { SpotifyTrack, SpotifyPlaylist } from "@shared/schema";

interface SpotifyPlayerProps {
  currentTrack?: SpotifyTrack;
  currentPlaylist?: SpotifyPlaylist;
}

import { Button } from '@/components/ui/button';

export default function SpotifyPlayer({ currentTrack, currentPlaylist }: SpotifyPlayerProps) {
  if (!currentTrack && !currentPlaylist) {
    return null;
  }
  
  const openInSpotify = () => {
    if (currentPlaylist) {
      // Open the playlist in Spotify
      window.open(`https://open.spotify.com/playlist/${currentPlaylist.id}`, '_blank');
    } else if (currentTrack) {
      // Open the track in Spotify
      window.open(`https://open.spotify.com/track/${currentTrack.id}`, '_blank');
    }
  };
  
  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex items-center mb-3">
        <div className="spotify-wave mr-3">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="text-sm font-medium text-secondary">Spotify Break Music</div>
      </div>
      
      <div className="flex items-center">
        {/* Album Art */}
        {currentTrack?.albumArt ? (
          <img 
            src={currentTrack.albumArt} 
            alt={`${currentTrack.name} album art`} 
            className="w-16 h-16 rounded shadow-sm mr-4" 
          />
        ) : (
          <div className="w-16 h-16 rounded shadow-sm mr-4 bg-gray-200 flex items-center justify-center">
            <span className="material-icons text-gray-400">music_note</span>
          </div>
        )}
        
        <div className="flex-1">
          {currentTrack ? (
            <>
              <h3 className="font-medium text-neutral-dark truncate">
                {currentTrack.name}
              </h3>
              <p className="text-sm text-neutral-dark opacity-75 truncate">
                {currentTrack.artists.join(", ")}
              </p>
            </>
          ) : (
            <h3 className="font-medium text-neutral-dark">Ready to play music during your break</h3>
          )}
          
          {currentPlaylist && (
            <div className="flex items-center mt-2">
              <span className="material-icons text-sm text-secondary mr-1">playlist_play</span>
              <span className="text-xs text-neutral-dark opacity-75">
                {currentPlaylist.name}
              </span>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-3 flex justify-center">
        <Button onClick={openInSpotify} className="w-full">
          <span className="mr-2">Play in Spotify</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="4"/>
            <path d="M4.9 4.9L9 9"/>
            <path d="M14.9 9.1L19 4"/>
            <path d="M14.9 14.9L19 19"/>
            <path d="M4.9 19.1L9 15"/>
          </svg>
        </Button>
      </div>
    </div>
  );
}
