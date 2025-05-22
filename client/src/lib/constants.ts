// Default durations in seconds
export const DEFAULT_STUDY_DURATION = 7200; // 2 hours
export const DEFAULT_BREAK_DURATION = 300; // 5 minutes

// Spotify API scopes
export const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-read-playback-state',
  'user-modify-playback-state',
  'playlist-read-private',
  'playlist-read-collaborative',
  'streaming'
];

// Notification sounds
export const NOTIFICATION_SOUNDS = {
  BREAK_START: '/sounds/break-start.mp3',
  STUDY_START: '/sounds/study-start.mp3'
};
