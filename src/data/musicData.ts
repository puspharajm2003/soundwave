import { Song, Playlist, UserProfile } from "@/types/music";

// Mock data (DEPRECATED - Moved to Real Neon DB)
// Keeping empty exports to satisfy existing imports until refactor is complete.

export const demoSongs: Song[] = [];

export const demoPlaylists: Playlist[] = [];

export const userProfile: UserProfile = {
  id: "u1",
  username: "Alex Chen",
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop&q=60",
  themeColor: "cyan",
  preferredQuality: "high",
  autoDownload: true,
  offlineMode: false
};
