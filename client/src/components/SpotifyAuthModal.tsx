import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SpotifyAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => void;
}

export default function SpotifyAuthModal({ isOpen, onClose, onConnect }: SpotifyAuthModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary rounded-full">
              <span className="material-icons text-white text-3xl">music_note</span>
            </div>
          </div>
          <DialogTitle className="text-xl font-medium mb-2">Connect to Spotify</DialogTitle>
        </DialogHeader>
        
        <p className="text-sm text-neutral-dark mb-6">
          StudyBeats needs access to your Spotify account to play music during breaks.
        </p>
        
        <Button 
          onClick={onConnect}
          className="bg-secondary text-white px-6 py-6 rounded-full shadow-md hover:shadow-lg transition-shadow flex items-center justify-center w-full"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
            <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="#1DB954"/>
            <path d="M16.7346 16.9115C16.5039 17.2577 16.0559 17.3374 15.7097 17.1066C13.4447 15.7376 10.6488 15.4394 6.99974 16.3059C6.59772 16.4029 6.19971 16.1427 6.10272 15.7407C6.00475 15.3387 6.26492 14.9407 6.66694 14.8427C10.6687 13.8764 13.8175 14.2344 16.3893 15.7866C16.7355 16.0173 16.8152 16.4654 16.5845 16.8116ZM17.9499 14.0797C17.664 14.5047 17.1001 14.6052 16.6761 14.3194C14.0827 12.7345 10.2138 12.2945 7.14975 13.3244C6.67384 13.4751 6.16889 13.2089 6.01817 12.733C5.86843 12.2561 6.13466 11.7521 6.61058 11.6014C10.1725 10.4006 14.4753 10.9014 17.5112 12.8059C17.9353 13.0918 18.0358 13.6557 17.7499 14.0797ZM17.9991 11.1689C14.9362 9.32239 9.83538 9.10844 6.40992 10.157C5.84374 10.3365 5.23974 10.0163 5.06024 9.45012C4.88074 8.88394 5.20099 8.27994 5.76717 8.10045C9.68381 6.89344 15.3599 7.14741 18.9282 9.28791C19.4513 9.61391 19.6044 10.2879 19.2784 10.8099C18.9534 11.332 18.2784 11.486 17.7574 11.1599L17.9991 11.1689Z" fill="white"/>
          </svg>
          Connect with Spotify
        </Button>
      </DialogContent>
    </Dialog>
  );
}
