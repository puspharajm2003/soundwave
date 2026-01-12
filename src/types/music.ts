export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  thumbnail: string;
  source: "youtube" | "online" | "local";
  youtubeId?: string;
  isDownloaded: boolean;
  streamUrl?: string;
  waveform?: number[];
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  songs: Song[];
  type: "youtube" | "online" | "offline" | "custom" | "smart";
  createdAt: Date;
  songCount: number;
}

export interface UserProfile {
  id: string;
  username: string;
  avatarUrl: string;
  themeColor: string;
  preferredQuality: "low" | "medium" | "high";
  autoDownload: boolean;
  offlineMode: boolean;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  shuffle: boolean;
  repeat: "none" | "one" | "all";
  queue: Song[];
  queueIndex: number;
}
