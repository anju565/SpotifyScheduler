import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import TimerCircle from "@/components/TimerCircle";
import SpotifyPlayer from "@/components/SpotifyPlayer";
import SettingsModal from "@/components/SettingsModal";
import SpotifyAuthModal from "@/components/SpotifyAuthModal";
import Notification from "@/components/Notification";
import { useTimer } from "@/hooks/useTimer";
import { useSpotify } from "@/hooks/useSpotify";
import { DEFAULT_STUDY_DURATION, DEFAULT_BREAK_DURATION } from "@/lib/constants";

export default function Timer() {
  const { toast } = useToast();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBreakNotification, setShowBreakNotification] = useState(false);
  const [showStudyNotification, setShowStudyNotification] = useState(false);
  
  const {
    isConnected: isSpotifyConnected,
    currentTrack,
    currentPlaylist,
    connect: connectToSpotify,
    playlists,
    selectedPlaylist,
    setSelectedPlaylist,
    playTrackFromPlaylist,
  } = useSpotify();
  
  const {
    isRunning,
    isStudyMode,
    currentSeconds,
    studyDuration,
    breakDuration,
    playNotification,
    setStudyDuration,
    setBreakDuration,
    setPlayNotification,
    start,
    pause,
    reset,
    skip,
  } = useTimer({
    defaultStudyDuration: DEFAULT_STUDY_DURATION,
    defaultBreakDuration: DEFAULT_BREAK_DURATION,
    onStudyComplete: () => {
      if (playNotification) {
        setShowBreakNotification(true);
        setTimeout(() => setShowBreakNotification(false), 5000);
      }
      
      // Automatically play music from selected playlist during break
      if (isSpotifyConnected && selectedPlaylist) {
        playTrackFromPlaylist();
        toast({
          title: "Break Time!",
          description: `Playing music from "${selectedPlaylist.name}" playlist`
        });
      }
    },
    onBreakComplete: () => {
      if (playNotification) {
        setShowStudyNotification(true);
        setTimeout(() => setShowStudyNotification(false), 5000);
      }
    }
  });

  // Check if Spotify is connected on mount, close modal if connected
  useEffect(() => {
    if (!isSpotifyConnected) {
      setShowAuthModal(true);
    } else {
      setShowAuthModal(false);
      toast({
        title: "Spotify Connected",
        description: "Your Spotify account is now connected to StudyBeats"
      });
    }
  }, [isSpotifyConnected]);

  const handlePlayPause = () => {
    if (!isSpotifyConnected) {
      setShowAuthModal(true);
      return;
    }
    
    if (isRunning) {
      pause();
    } else {
      start();
    }
  };

  const saveSettings = (settings: {
    studyDuration: number;
    breakDuration: number;
    playNotification: boolean;
    selectedPlaylistId?: string;
  }) => {
    setStudyDuration(settings.studyDuration);
    setBreakDuration(settings.breakDuration);
    setPlayNotification(settings.playNotification);
    
    if (settings.selectedPlaylistId) {
      const playlist = playlists.find(p => p.id === settings.selectedPlaylistId);
      if (playlist) {
        setSelectedPlaylist(playlist);
        toast({
          title: "Playlist Selected",
          description: `"${playlist.name}" will play during your breaks`
        });
      }
    }
    
    setShowSettingsModal(false);
    reset();
    
    toast({
      title: "Settings saved",
      description: "Your timer settings have been updated",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-light" data-state={isStudyMode ? "study" : "break"}>
      {/* Header */}
      <header className="bg-white shadow px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <span className="material-icons text-primary mr-2">timer</span>
          <h1 className="text-xl font-medium">StudyBeats</h1>
        </div>
        
        <button 
          onClick={() => setShowSettingsModal(true)} 
          className="p-2 rounded-full hover:bg-neutral-light transition-colors"
        >
          <span className="material-icons text-neutral-dark">settings</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Study/Break Status */}
        <div className="mb-8 text-center">
          <div className="text-lg font-medium mb-1">
            {isStudyMode ? "Study Session" : "Break Time"}
          </div>
          <div className="text-sm text-neutral-dark opacity-75">
            {isStudyMode ? "Focus time with no distractions" : "Relax while a song plays"}
          </div>
        </div>
        
        {/* Timer Circle */}
        <TimerCircle 
          currentSeconds={currentSeconds}
          totalSeconds={isStudyMode ? studyDuration : breakDuration}
          isStudyMode={isStudyMode}
          statusText={isStudyMode ? "Study time remaining" : "Break time remaining"}
        />
        
        {/* Controls */}
        <div className="flex justify-center items-center space-x-4 mb-8">
          <button 
            onClick={reset}
            className="p-3 rounded-full bg-neutral-white shadow-md hover:shadow-lg transition-shadow"
          >
            <span className="material-icons text-status-warning">refresh</span>
          </button>
          
          <button 
            onClick={handlePlayPause}
            className="p-5 rounded-full bg-primary text-white shadow-md hover:shadow-lg transition-shadow"
          >
            <span className="material-icons">
              {isRunning ? "pause" : "play_arrow"}
            </span>
          </button>
          
          <button 
            onClick={skip}
            className="p-3 rounded-full bg-neutral-white shadow-md hover:shadow-lg transition-shadow"
          >
            <span className="material-icons text-neutral-dark">skip_next</span>
          </button>
        </div>
        
        {/* Spotify Player */}
        {!isStudyMode && isSpotifyConnected && (
          <SpotifyPlayer 
            currentTrack={currentTrack} 
            currentPlaylist={currentPlaylist}
          />
        )}
      </main>
      
      {/* Break Time Notification */}
      <Notification 
        show={showBreakNotification}
        icon="music_note"
        title="Break Time!"
        message="Playing a song from your playlist"
        bgColor="bg-secondary"
      />
      
      {/* Study Time Notification */}
      <Notification 
        show={showStudyNotification}
        icon="schedule"
        title="Back to Study!"
        message="Break time is over"
        bgColor="bg-primary"
      />
      
      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onSave={saveSettings}
        isSpotifyConnected={isSpotifyConnected}
        playlists={playlists}
        studyDuration={studyDuration}
        breakDuration={breakDuration}
        playNotification={playNotification}
        selectedPlaylist={selectedPlaylist}
      />
      
      {/* Spotify Auth Modal */}
      <SpotifyAuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onConnect={connectToSpotify}
      />
    </div>
  );
}
