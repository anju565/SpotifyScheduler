import { SpotifyTrack, SpotifyPlaylist } from "@shared/schema";

interface SpotifyPlayerProps {
  currentTrack?: SpotifyTrack;
  currentPlaylist?: SpotifyPlaylist;
}

export default function SpotifyPlayer({ currentTrack, currentPlaylist }: SpotifyPlayerProps) {
  if (!currentTrack) {
    return null;
  }
  
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
        <div className="text-sm font-medium text-secondary">Now Playing from Spotify</div>
      </div>
      
      <div className="flex items-center">
        {/* Album Art */}
        {currentTrack.albumArt ? (
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
          <h3 className="font-medium text-neutral-dark truncate">
            {currentTrack.name}
          </h3>
          <p className="text-sm text-neutral-dark opacity-75 truncate">
            {currentTrack.artists.join(", ")}
          </p>
          
          {currentPlaylist && (
            <div className="flex items-center mt-2">
              <span className="material-icons text-sm text-secondary mr-1">playlist_play</span>
              <span className="text-xs text-neutral-dark opacity-75">
                {currentPlaylist.name}
              </span>
            </div>
          )}
        </div>
        
        <button className="p-2 rounded-full hover:bg-neutral-light transition-colors">
          <span className="material-icons text-neutral-dark">volume_up</span>
        </button>
      </div>
    </div>
  );
}
