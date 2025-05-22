import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SpotifyPlaylist } from "@shared/schema";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: {
    studyDuration: number;
    breakDuration: number;
    playNotification: boolean;
    selectedPlaylistId?: string;
  }) => void;
  isSpotifyConnected: boolean;
  playlists: SpotifyPlaylist[];
  studyDuration: number;
  breakDuration: number;
  playNotification: boolean;
  selectedPlaylist?: SpotifyPlaylist;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onSave,
  isSpotifyConnected,
  playlists,
  studyDuration,
  breakDuration,
  playNotification,
  selectedPlaylist,
}: SettingsModalProps) {
  const [newStudyDuration, setNewStudyDuration] = useState(studyDuration.toString());
  const [newBreakDuration, setNewBreakDuration] = useState(breakDuration.toString());
  const [newPlayNotification, setNewPlayNotification] = useState(playNotification);
  const [newSelectedPlaylistId, setNewSelectedPlaylistId] = useState(selectedPlaylist?.id || "");

  const handleSave = () => {
    onSave({
      studyDuration: parseInt(newStudyDuration),
      breakDuration: parseInt(newBreakDuration),
      playNotification: newPlayNotification,
      selectedPlaylistId: newSelectedPlaylistId || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <Label className="block text-sm font-medium text-neutral-dark mb-1">Spotify Connection</Label>
            <div className="bg-neutral-light rounded p-3 flex items-center">
              {isSpotifyConnected ? (
                <>
                  <span className="material-icons text-secondary mr-2">check_circle</span>
                  <span className="text-sm">Connected to Spotify</span>
                  <button className="ml-auto text-sm text-primary font-medium">Disconnect</button>
                </>
              ) : (
                <>
                  <span className="material-icons text-status-error mr-2">error</span>
                  <span className="text-sm">Not connected</span>
                  <button className="ml-auto text-sm text-primary font-medium">Connect</button>
                </>
              )}
            </div>
          </div>
          
          {isSpotifyConnected && (
            <div className="mb-4">
              <Label className="block text-sm font-medium text-neutral-dark mb-1">Select Playlist for Breaks</Label>
              {playlists.length > 0 ? (
                <>
                  <Select value={newSelectedPlaylistId} onValueChange={setNewSelectedPlaylistId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a playlist" />
                    </SelectTrigger>
                    <SelectContent>
                      {playlists.map((playlist) => (
                        <SelectItem key={playlist.id} value={playlist.id}>
                          {playlist.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-neutral-dark mt-1">Music from this playlist will play during breaks</p>
                </>
              ) : (
                <div className="bg-neutral-light rounded p-3 flex items-center">
                  <span className="material-icons text-status-warning mr-2">info</span>
                  <span className="text-sm">Loading your playlists...</span>
                </div>
              )}
            </div>
          )}
          
          <div className="mb-4">
            <Label className="block text-sm font-medium text-neutral-dark mb-1">Study Session Duration</Label>
            <Select value={newStudyDuration} onValueChange={setNewStudyDuration}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3600">1 hour</SelectItem>
                <SelectItem value="5400">1.5 hours</SelectItem>
                <SelectItem value="7200">2 hours (default)</SelectItem>
                <SelectItem value="9000">2.5 hours</SelectItem>
                <SelectItem value="10800">3 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="mb-4">
            <Label className="block text-sm font-medium text-neutral-dark mb-1">Break Duration</Label>
            <Select value={newBreakDuration} onValueChange={setNewBreakDuration}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="300">5 minutes (default)</SelectItem>
                <SelectItem value="600">10 minutes</SelectItem>
                <SelectItem value="900">15 minutes</SelectItem>
                <SelectItem value="1200">20 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="mb-6 flex items-center space-x-2">
            <Checkbox 
              id="notification" 
              checked={newPlayNotification} 
              onCheckedChange={(checked) => setNewPlayNotification(checked as boolean)}
            />
            <Label htmlFor="notification" className="text-sm">Play audio notification</Label>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-primary text-white">
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
